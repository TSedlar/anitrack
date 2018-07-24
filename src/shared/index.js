import { WebExtension } from './app/WebExtension'
import { MediaHandler, MAX_MANGA_CYCLE } from './app/MediaHandler'
import { Task } from './app/helpers/Task'
import { MyAnimeList } from './app/service/MyAnimeList'
import { Kitsu } from './app/service/Kitsu'

import * as _ from 'lodash'
const cheerio = require('cheerio')
const sources = require('./sources.json')

const HANDLERS = []

for (let x in sources['sources']) {
  HANDLERS.push(new MediaHandler(sources['sources'][x]))
}

const READ_CACHE = []
const INJECTED = []
const CYCLES = {}

let inject = (tabId) => {
  // eslint-disable-next-line no-undef
  chrome.tabs.executeScript(tabId, { file: 'content.js' })
}

let isHandledWebsite = (url) => {
  for (let handler in HANDLERS) {
    if (HANDLERS[handler].accept(url)) {
      return true
    }
  }
  return false
}

let handleInject = (tabId) => {
  WebExtension.getCurrentTabURL()
    .then(url => {
      if (url.startsWith('http') && isHandledWebsite(url)) {
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
    if (isHandledWebsite(key)) {
      if (CYCLES[key]) {
        CYCLES[key].end = undefined
      } else {
        CYCLES[key] = { start: new Date().getTime() }
      }
      handleInject(obj.tabId)
    }
  })
})

let oldTabURL = null

// eslint-disable-next-line no-undef
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('chrome.tabs updated')
  if (changeInfo.status === 'complete') {
    let key = tab.url.toLowerCase()
    if (isHandledWebsite(key)) {
      if (oldTabURL) {
        console.log(`set end cycle for ${oldTabURL}`)
        CYCLES[oldTabURL].end = new Date().getTime()
      }
      console.log(`set cycle start for ${tab.url}`)
      CYCLES[key] = { start: new Date().getTime() }
      oldTabURL = key
      if (!_.includes(INJECTED, tabId)) {
        handleInject(tabId)
      }
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
  } else if (serviceName === 'Kitsu') {
    service = new Kitsu()
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
          if (handler.accept(tab.url.toLowerCase())) {
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
              let baseURL = handler.baseURL
              let anime = handler['data']['type'] === 'anime'
              if (!_.includes(READ_CACHE, baseURL)) {
                console.log(`Handling ${url}`)
                WebExtension.getPageSource(tab.id)
                  .then(source => {
                    let $ = cheerio.load(source)
                    let life = handler.lifeOf(CYCLES[url])
                    console.log(`life: ${life}`)
                    if (handler.verifyCycle(CYCLES[url])) {
                      let data = handler.parseData($)
                      if (anime || data.page > (data.pageCount / 2) || life > MAX_MANGA_CYCLE) {
                        console.log('data:')
                        console.log(data)
                        let searchFunc = anime ? service.resolveAnimeSearch(data.title)
                          : service.resolveMangaSearch(data.title)
                        searchFunc
                          .then(result => {
                            console.log(result)
                            console.log(`id: ${result.id}`)
                            service.checkEpisode(result.id, anime ? 'anime' : 'manga')
                              .then(epCount => {
                                console.log('Updating list service...')
                                if (data.episode <= epCount) {
                                  console.log('Already up to date')
                                  READ_CACHE.push(url)
                                } else {
                                  let episodes = 0
                                  let status = 0
                                  if (service instanceof Kitsu) {
                                    episodes = parseInt(result['attributes'][anime ? 'episodeCount' : 'chapterCount'])
                                    status = (data.episode === episodes ? 'complete' : 'current')
                                  } else if (service instanceof MyAnimeList) {
                                    episodes = parseInt(result['episodes'][0])
                                    status = (data.episode === episodes ? 2 : 1)
                                  }
                                  console.log(`totalEpisodes: ${episodes}`)
                                  console.log(`status: ${status}`)
                                  let updateFunc = anime ? service.updateAnimeList(result.id, status, data.episode)
                                    : service.updateMangaList(result.id, status, data.episode)
                                  updateFunc
                                    .then(res => {
                                      console.log(res)
                                      console.log('Updated!')
                                      READ_CACHE.push(baseURL)
                                      if (status === 2) {
                                        // prompt to rate.. if video isn't visible.
                                      }
                                    })
                                }
                              })
                          })
                      } else {
                        console.log(`not matchable yet: ${MAX_MANGA_CYCLE - life}`)
                        console.log(data)
                      }
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
