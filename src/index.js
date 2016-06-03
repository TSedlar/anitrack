import { Task } from './Task'
import { HTVAnimeHandler } from './handlers/HTVAnimehandler'
import { Chrome } from './Chrome'
import MyAnimeList from './MyAnimeList'
import * as _ from 'lodash'

const cheerio = require('cheerio')

const HANDLERS = [
  new HTVAnimeHandler()
]

const READ_CACHE = []

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
  console.log('chrome.tabs activated')
  handleInject(obj.tabId)
})

// eslint-disable-next-line no-undef
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('chrome.tabs updated')
  if (changeInfo.status === 'complete') {
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
                    if (handler.verify(source, $)) {
                      let data = handler.parseData(source, $)
                      console.log(`title: ${data.title}`)
                      console.log(`episode: ${data.episode}`)
                      MyAnimeList.searchAnime(data.title)
                        .then(result => {
                          console.log(`id: ${result.id}`)
                          MyAnimeList.checkEpisode(result.id)
                            .then(remoteId => {
                              console.log('Updating MyAnimeList...')
                              if (data.episode <= remoteId) {
                                console.log('Already up to date')
                                READ_CACHE.push(url)
                              } else {
                                let totalEpisodes = parseInt(result.episodes[0])
                                let status = (data.episode === totalEpisodes ? 2 : 1)
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
