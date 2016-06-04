import { Roman } from './Roman'
import { Promises } from './Promises'
import * as _ from 'lodash'

const request = require('request')
const xml2js = require('xml2js').parseString

const auth = (user, pass) => {
  const joined = `${user}:${pass}`
  const b64 = new Buffer(joined).toString('base64')
  return `Basic ${b64}`
}

const createXMLForm = (json) => {
  let generated = ''
  _.each(json, (val, key) => {
    generated += `<${key}>${val}</${key}>`
  })
  return { data: `<?xml version="1.0" encoding="UTF-8"?><entry>${generated}</entry>` }
}

let mUsername = ''
let mPassword = ''

export default class MyAnimeList {

  static authenticate (user, pass) {
    mUsername = user
    mPassword = pass
  }

  static api (suffix) {
    return `http://myanimelist.net/api/${suffix}`
  }

  static anime (suffix) {
    return this.api(`anime/${suffix}`)
  }

  static animelist (suffix) {
    return this.api(`animelist/${suffix}`)
  }

  static manga (suffix) {
    return this.api(`manga/${suffix}`)
  }

  static mangalist (suffix) {
    return this.api(`mangalist/${suffix}`)
  }

  static useAPI (apiURL, json) {
    return new Promise((resolve, reject) => {
      request.post({
        url: apiURL,
        type: 'POST',
        headers: {
          Authorization: auth(mUsername, mPassword),
          'content-type': 'application/xml'
        },
        form: json
      }, (error, response, body) => {
        if (error) {
          reject(error)
        } else {
          resolve({ responseCode: response.statusCode, content: body })
        }
      })
    })
  }

  static addAnime (id, json) {
    return this.useAPI(this.animelist(`add/${id}.xml`), createXMLForm(json))
  }

  static updateAnime (id, json) {
    return this.useAPI(this.animelist(`update/${id}.xml`), createXMLForm(json))
  }

  static addManga (id, json) {
    return this.useAPI(this.mangalist(`add/${id}.xml`), createXMLForm(json))
  }

  static updateManga (id, json) {
    return this.useAPI(this.mangalist(`update/${id}.xml`), createXMLForm(json))
  }

  static search (apiURL, query) {
    return new Promise((resolve, reject) =>
      this.useAPI(apiURL, { q: query })
        .then((result) => {
          xml2js(result.content, (err, res) => {
            if (err) {
              reject(err)
            } else {
              if (!res) {
                reject('No matching entry found')
              } else {
                resolve(apiURL.indexOf('/manga') >= 0 ? res.manga.entry[0] : res.anime.entry[0])
              }
            }
          })
        }).catch((err) => reject(err)))
  }

  static searchAnime (query) {
    return this.search(this.anime('search.xml'), query)
  }

  static searchManga (query) {
    return this.search(this.manga('search.xml'), query)
  }

  static resolveAnimeSearch (title) {
    let titles = this.findNormalTitles(title)
    return new Promise((resolve, reject) => {
      Promises.forceAll(titles.map(aTitle => this.searchAnime(aTitle)))
        .then(results => resolve(results[0]))
        .catch(err => reject(err))
    })
  }

  static appinfo (id, type = 'anime') {
    return new Promise((resolve, reject) => {
      let url = `http://myanimelist.net/malappinfo.php?u=${mUsername}&status=1&type=${type}`
      request({
        uri: url
      }, (error, response, body) => {
        if (error) {
          reject(error)
        } else {
          xml2js(body, (err, res) => {
            if (err) {
              reject(err)
            } else {
              resolve(res)
            }
          })
        }
      })
    })
  }

  static findListEntry (id, type = 'anime') {
    return new Promise((resolve, reject) => {
      let usingAnime = (type === 'anime')
      this.appinfo(id, type)
        .then(result => {
          let array = (usingAnime ? result.myanimelist.anime : result.myanimelist.manga)
          let match = _.find(array, (entry) => {
            let idArray = (usingAnime ? entry.series_animedb_id : entry.series_mangadb_id)
            return idArray[0] === id.toString()
          })
          resolve(match)
        })
        .catch(err => reject(err))
    })
  }

  static checkEpisode (id, type = 'anime') {
    return new Promise((resolve, reject) => {
      let usingAnime = (type === 'anime')
      this.findListEntry(id, type)
        .then(result => {
          if (result) {
            resolve(parseInt(usingAnime ? result.my_watched_episodes : result.my_read_chapters))
          } else {
            reject('No matching entry found')
          }
        })
        .catch(err => reject(err))
    })
  }

  static updateAnimeList (id, status, episode) {
    return new Promise((resolve, reject) => {
      this.findListEntry(id)
        .then(result => {
          if (result !== undefined) {
            this.updateAnime(id, { status, episode })
              .then(res => resolve(res))
              .catch(err => reject(err))
          } else {
            this.addAnime(id, { status, episode })
              .then(res => resolve(res))
              .catch(err => reject(err))
          }
        })
    })
  }

  static verifyCredentials () {
    return this.useAPI(this.api('account/verify_credentials.xml'), {})
  }

  static findNormalTitles (title) {
    let lower = title.toLowerCase()
    let season = -1
    let seasonRegex = /season (\d+)/g
    let matches = seasonRegex.exec(lower)
    let titles = []
    let baseTitle = null
    if (matches) {
      season = matches[1]
      baseTitle = lower.replace('(', '').replace(')', '').replace(`season ${season}`, '').trim()
      titles.push(`${baseTitle} season ${season}`)
      titles.push(`${baseTitle} ${Roman.romanize(season)}`)
    } else {
      let splits = lower.split(' ')
      let roman = splits[splits.length - 1]
      let result = Roman.deromanize(roman)
      if (result) {
        season = result
        baseTitle = splits.slice(0, -1).join(' ')
        titles.push(`${baseTitle} ${roman}`)
        titles.push(`${baseTitle} season ${season}`)
      }
    }
    if (season === -1) {
      titles.push(title)
    }
    return titles
  }
}
