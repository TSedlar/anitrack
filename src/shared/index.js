import { WebExtension } from './app/WebExtension'
import { Task } from './app/helpers/Task'
import { MyAnimeList } from './app/service/MyAnimeList'
import { AmazonPrimeHandler } from './app/handlers/AmazonPrimeHandler'
import { AnimeHavenHandler } from './app/handlers/AnimeHavenHandler'
import { ChiaAnimeHandler } from './app/handlers/ChiaAnimeHandler'
import { CrunchyrollHandler } from './app/handlers/CrunchyrollHandler'
import { DaisukiHandler } from './app/handlers/DaisukiHandler'
import { FunimationHandler } from './app/handlers/FunimationHandler'
import { GoGoAnimeHandler } from './app/handlers/GoGoAnimeHandler'
import { HTVAnimeHandler } from './app/handlers/HTVAnimeHandler'
import { HuluHandler } from './app/handlers/HuluHandler'
import { KissAnimeHandler } from './app/handlers/KissAnimeHandler'
import { MasterAniHandler } from './app/handlers/MasterAniHandler'
import { MoeTubeHandler } from './app/handlers/MoeTubeHandler'
import { NetflixHandler } from './app/handlers/NetflixHandler'

import * as _ from 'lodash'
const cheerio = require('cheerio')

const HANDLERS = [
  new AmazonPrimeHandler(),
  new AnimeHavenHandler(),
  new ChiaAnimeHandler(),
  new CrunchyrollHandler(),
  new DaisukiHandler(),
  new FunimationHandler(),
  new GoGoAnimeHandler(),
  new HTVAnimeHandler(),
  new HuluHandler(),
  new KissAnimeHandler(),
  new MasterAniHandler(),
  new MoeTubeHandler(),
  new NetflixHandler()
]

const READ_CACHE = []
const INJECTED = []
const CYCLES = {}

let inject = (tabId) => {
  // eslint-disable-next-line no-undef
  chrome.tabs.executeScript(tabId, { file: 'content.js' })
}

let handleInject = (tabId) => {
  WebExtension.getCurrentTabURL()
    .then(url => {
      if (url.startsWith('http')) {
        console.log('Injecting content')
        inject(tabId)
        INJECTED.push(tabId)
        console.log('Injected')
      }
    })
}

// eslint-disable-next-line no-undef
chrome.tabs.onActivated.addListener((obj) => {
  // eslint-disable-next-line no-undef
  chrome.tabs.get(obj.tabId, (tab) => {
    console.log('chrome.tabs activated')
    let key = tab.url.toLowerCase()
    if (CYCLES[key]) {
      CYCLES[key].end = undefined
    } else {
      CYCLES[key] = { start: new Date().getTime() }
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
    let key = tab.url.toLowerCase()
    CYCLES[key] = { start: new Date().getTime() }
    oldTabURL = key
    if (!_.includes(INJECTED, tabId)) {
      handleInject(tabId)
    }
  }
})

let hasCredKeys = (obj) => {
  let keys = ['username', 'password', 'service']
  return keys.every((item) => obj.hasOwnProperty(item))
}

let checkCredentials = () => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    chrome.storage.local.get('credentials', (storage) => {
      if (storage && storage.credentials && hasCredKeys(storage.credentials)) {
        resolve(storage)
      } else {
        reject('Please click my icon and sign in to enable scrobbling')
      }
    })
  })
}

let notified = false

let service = null

let setServiceObject = (serviceName) => {
  if (serviceName === 'MyAnimeList') {
    service = new MyAnimeList()
  }
}

// eslint-disable-next-line no-undef
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    if (msg && msg.action) {
      switch (msg.action) {
        case 'auth': {
          setServiceObject(msg.service)
          // eslint-disable-next-line no-undef
          chrome.storage.local.set({
            credentials: {
              username: msg.username,
              password: msg.password,
              service: msg.service
            }
          }, () => {
            checkCredentials()
              .then(storage => {
                service.authenticate(storage.credentials.username, storage.credentials.password)
                service.verifyCredentials()
                  .then(result => {
                    let success = (result && result.responseCode === 200)
                    port.postMessage({ action: 'auth', success: success })
                  })
                  .catch(err => port.postMessage({ action: 'auth', success: false, message: err }))
              })
          })
          break
        }
        case 'requestCreds': {
          checkCredentials()
            .then(storage => {
              storage.action = 'requestCreds'
              port.postMessage(storage)
            })
          break
        }
      }
    }
  })
})

let lastValidTabVal = null

let lastValidTab = () => {
  return new Promise((resolve, reject) => {
    WebExtension.getCurrentTab()
      .then(tab => {
        let resolved = false
        _.each(HANDLERS, (handler) => {
          if (handler.accept(tab.url)) {
            resolved = true
            lastValidTabVal = tab
            resolve(lastValidTabVal)
          }
        })
        if (!resolved) {
          if (lastValidTabVal) {
            resolve(lastValidTabVal)
          } else {
            reject('last valid tab not found')
          }
        }
      })
      .catch(err => reject(err))
  })
}

console.log('Started background task')

new Task(() => {
  checkCredentials()
    .then(storage => {
      setServiceObject(storage.credentials.service)
      service.authenticate(storage.credentials.username, storage.credentials.password)
      lastValidTab()
        .then(tab => {
          let url = tab.url.toLowerCase()
          _.each(HANDLERS, (handler) => {
            if (handler.accept(url)) {
              if (!_.includes(READ_CACHE, url)) {
                console.log(`Handling ${url}`)
                WebExtension.getPageSource(tab.id)
                  .then(source => {
                    let $ = cheerio.load(source)
                    console.log(`life: ${handler.lifeOf(CYCLES[url])}`)
                    if (handler.verify(source, CYCLES[url], $)) {
                      let data = handler.parseData(source, $)
                      console.log(`title: ${data.title}`)
                      console.log(`episode: ${data.episode}`)
                      service.resolveAnimeSearch(data.title)
                        .then(result => {
                          console.log(`id: ${result.id}`)
                          service.checkEpisode(result.id)
                            .then(epCount => {
                              console.log('Updating MyAnimeList...')
                              if (data.episode <= epCount) {
                                console.log('Already up to date')
                                READ_CACHE.push(url)
                              } else {
                                let totalEpisodes = parseInt(result.episodes[0])
                                let status = (data.episode === totalEpisodes ? 2 : 1)
                                console.log(`totalEpisodes: ${totalEpisodes}`)
                                console.log(`status: ${status}`)
                                service.updateAnimeList(result.id, status, data.episode)
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
        // eslint-disable-next-line no-undef
        chrome.notifications.create('cred-notif', {
          type: 'basic',
          title: 'mal-scrobble',
          message: err,
          iconUrl: 'images/icon128.png'
        })
        notified = true
      }
    })
}, 10000).start()
