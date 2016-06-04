import { Task } from './Task'
import { HTVAnimeHandler } from './handlers/HTVAnimehandler'
import { CrunchyrollHandler } from './handlers/CrunchyrollHandler'
import { Chrome } from './Chrome'
import MyAnimeList from './MyAnimeList'
import * as _ from 'lodash'

const cheerio = require('cheerio')

const HANDLERS = [
  new HTVAnimeHandler(),
  new CrunchyrollHandler()
]

const READ_CACHE = []
const CYCLES = {}

let inject = (tabId) => {
  // eslint-disable-next-line no-undef
  chrome.tabs.executeScript(tabId, { file: 'content.js' })
}

let handleInject = (tabId) => {
  Chrome.getCurrentTabURL()
    .then(url => {
      if (url.startsWith('http')) {
        console.log('Injecting content')
        inject(tabId)
        console.log('Injected')
      }
    })
}

// eslint-disable-next-line no-undef
chrome.tabs.onActivated.addListener((obj) => {
  // eslint-disable-next-line no-undef
  chrome.tabs.get(obj.tabId, (tab) => {
    console.log('chrome.tabs activated')
    if (CYCLES[tab.url]) {
      CYCLES[tab.url].end = undefined
    } else {
      CYCLES[tab.url] = { start: new Date().getTime() }
    }
    handleInject(obj.tabId)
  })
})

let oldTabURL = null

// eslint-disable-next-line no-undef
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('chrome.tabs updated')
  if (changeInfo.status === 'complete') {
    if (oldTabURL) {
      console.log(`set end cycle for ${oldTabURL}`)
      CYCLES[oldTabURL].end = new Date().getTime()
    }
    console.log(`set cycle start for ${tab.url}`)
    CYCLES[tab.url] = { start: new Date().getTime() }
    oldTabURL = tab.url
    handleInject(tabId)
  }
})

let checkCredentials = () => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    chrome.storage.sync.get('credentials', (storage) => {
      if (storage && storage.credentials) {
        resolve(storage)
      } else {
        reject('MAL creds should be set by clicking the icon')
      }
    })
  })
}

let notified = false

// eslint-disable-next-line no-undef
chrome.extension.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    if (msg && msg.action) {
      if (msg.action === 'auth') {
        checkCredentials()
          .then(storage => {
            MyAnimeList.authenticate(storage.credentials.username, storage.credentials.password)
            MyAnimeList.verifyCredentials()
              .then(result => {
                let success = (result && result.responseCode === 200)
                port.postMessage({ action: 'auth', success: success })
              })
              .catch(err => port.postMessage({ action: 'auth', success: false, message: err }))
          })
      }
    }
  })
})

console.log('Started background task')
new Task(() => {
  checkCredentials()
    .then(storage => {
      MyAnimeList.authenticate(storage.credentials.username, storage.credentials.password)
      Chrome.getCurrentTabURL()
        .then(url => {
          url = url.toLowerCase()
          _.each(HANDLERS, (handler) => {
            if (handler.accept(url)) {
              if (!_.includes(READ_CACHE, url)) {
                console.log(`Handling ${url}`)
                Chrome.getPageSource()
                  .then(source => {
                    let $ = cheerio.load(source)
                    if (handler.verify(source, CYCLES[url], $)) {
                      let data = handler.parseData(source, $)
                      console.log(`title: ${data.title}`)
                      console.log(`episode: ${data.episode}`)
                      MyAnimeList.searchAnime(data.title)
                        .then(result => {
                          console.log(`id: ${result.id}`)
                          MyAnimeList.checkEpisode(result.id)
                            .then(remoteId => {
                              console.log('Updating MyAnimeList...')
                              console.log(`remoteId: ${remoteId}`)
                              if (data.episode <= remoteId) {
                                console.log('Already up to date')
                                READ_CACHE.push(url)
                              } else {
                                let totalEpisodes = parseInt(result.episodes[0])
                                let status = (data.episode === totalEpisodes ? 2 : 1)
                                console.log(`totalEpisodes: ${totalEpisodes}`)
                                console.log(`status: ${status}`)
                                MyAnimeList.updateAnimeList(result.id, status, data.episode)
                                  .then(res => {
                                    console.log('Updated!')
                                    READ_CACHE.push(url)
                                    if (status === 2) {
                                      // prompt to rate.. if video isn't visible.
                                    }
                                  })
                              }
                            })
                        })
                    }
                  })
              }
            }
          })
        })
    })
    .catch(err => {
      if (!notified) {
        alert(err)
        notified = true
      }
    })
}, 10000).start()
