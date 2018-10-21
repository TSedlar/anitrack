import { TrackingService } from './TrackingService'

import * as _ from 'lodash'

const request = require('request')

class Kitsu extends TrackingService {
  constructor () {
    super()
    this.token = null
    this.clientId = 'dd031b32d2f56c990b1425efe6c42ad847e7fe3ab46bf1299f05ecd856bdb7dd'
    this.clientSecret = '54d7307928f63414defd96399fc31ba847961ceaecef3a5fd93144e960c0e151'
  }

  useAPI (apiURL, type, json = {}) {
    return new Promise((resolve, reject) => {
      this._requestToken()
        .then(token => {
          request({
            url: apiURL,
            method: type,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
              'Authorization': `Bearer ${token['access_token']}`,
              'Content-Type': 'application/vnd.api+json'
            },
            body: JSON.stringify(json)
          }, (error, response, body) => {
            if (error) {
              reject(error)
            } else {
              resolve({ responseCode: response.statusCode, content: body })
            }
          })
        })
        .catch(err => reject(err))
    })
  }

  verifyCredentials () {
    return new Promise((resolve, reject) => {
      this._requestToken()
        .then(t => {
          if ('error' in t) {
            reject(t)
          } else {
            resolve({ responseCode: 200 })
          }
        })
        .catch(err => reject(err))
    })
  }

  api (suffix) {
    return `https://kitsu.io/api/edge/${suffix}`
  }

  anime (suffix) {
    return this.api(`anime?${suffix}`)
  }

  animelist (suffix = '') {
    return this.api(`library-entries/${suffix}`)
  }

  manga (suffix) {
    return this.api(`manga?${suffix}`)
  }

  mangalist (suffix = '') {
    return this.api(`library-entries/${suffix}`)
  }

  _formApiObj (uid, mid, extra = {}, type = 'anime') {
    let obj = {
      'data': {
        'type': 'library-entries',
        'attributes': {
          'status': 'current'
        },
        'relationships': {
          'user': {
            'data': {
              'type': 'users',
              'id': `${uid}`
            }
          }
        }
      }
    }
    obj['data']['relationships'][type] = {
      'data': {
        'type': type,
        'id': `${mid}`
      }
    }
    return _.merge(obj, extra)
  }

  _addType (id, type, json = {}) {
    return new Promise((resolve, reject) => {
      this._findUid()
        .then(uid => {
          this.useAPI(this.animelist(''), 'POST', this._formApiObj(uid, id, {
            'data': {
              'attributes': { 'progress': (json.progress ? json.progress : 1) }
            }
          }, type))
            .then(result => resolve(result))
            .catch(err => reject(err))
        }).catch(err => reject(err))
    })
  }

  _updateType (id, type, attributes) {
    return new Promise((resolve, reject) => {
      this._findUid()
        .then(uid => {
          request({
            uri: this.api(`library-entries?filter[user_id]=${uid}&filter[${type}Id]=${id}`)
          }, (error, response, body) => {
            if (error) {
              reject(error)
            } else {
              let data = JSON.parse(body)
              let realId = data['data'][0]['id']
              this.useAPI(this.mangalist(realId), 'PATCH',
                this._formApiObj(uid, id, {
                  'data': {
                    'id': `${realId}`,
                    'attributes': attributes,
                    'relationships': {
                      'mediaReaction': {
                        'data': null
                      }
                    }
                  }
                }, type))
                .then(result => resolve(result))
                .catch(err => reject(err))
            }
          })
        }).catch(err => reject(err))
    })
  }

  addAnime (id, json = {}) {
    return this._addType(id, 'anime', json)
  }

  updateAnime (id, attributes) {
    return this._updateType(id, 'anime', attributes)
  }

  addManga (id, json = {}) {
    return this._addType(id, 'manga', json)
  }

  updateManga (id, attributes) {
    return this._updateType(id, 'manga', attributes)
  }

  search (apiURL, query) {
    return new Promise((resolve, reject) =>
      this.useAPI(apiURL + `filter[text]=${query}`, 'GET')
        .then((result) => {
          resolve(sortResults(result).slice())
        }).catch((err) => reject(err)))
  }

  searchAnime (query) {
    return this.search(this.anime(''), query)
  }

  searchManga (query) {
    return this.search(this.manga(''), query)
  }

  _findUid () {
    return new Promise((resolve, reject) => {
      let url = this.api(`users?filter[name]=${this.user}`)
      request({
        uri: url
      }, (error, response, body) => {
        if (error) {
          reject(error)
        } else {
          let json = JSON.parse(body)
          resolve(json['data'][0]['id'])
        }
      })
    })
  }

  findListEntry (id, type = 'anime') {
    return new Promise((resolve, reject) => {
      this._findUid()
        .then(uid => {
          request({
            uri: this.api(`library-entries?filter[user_id]=${uid}&filter[${type}Id]=${id}`)
          }, (error, response, body) => {
            if (error) {
              resolve(undefined)
            } else {
              let data = JSON.parse(body)
              resolve(data['data'][0])
            }
          })
        }).catch(err => resolve(err))
    })
  }

  checkEpisode (id, type = 'anime') {
    return new Promise((resolve, reject) => {
      this.findListEntry(id, type)
        .then(result => {
          if (result) {
            resolve(parseInt(result['attributes']['progress']))
          } else {
            resolve(0)
          }
        })
        .catch(err => reject(err))
    })
  }

  updateAnimeList (id, status, episode) {
    console.log(`updateAnimeList(${id}, ${status}, ${episode})`)
    return new Promise((resolve, reject) => {
      this.findListEntry(id)
        .then(result => {
          if (result !== undefined) {
            this.updateAnime(id, {
              'status': status,
              'progress': episode
            })
              .then(res => resolve(res))
              .catch(err => reject(err))
          } else {
            this.addAnime(id, {
              'status': status,
              'progress': episode
            })
              .then(res => resolve(res))
              .catch(err => reject(err))
          }
        })
    })
  }

  updateMangaList (id, status, episode) {
    console.log(`updateMangaList(${id}, ${status}, ${episode})`)
    return new Promise((resolve, reject) => {
      this.findListEntry(id, 'manga')
        .then(result => {
          if (result !== undefined) {
            this.updateManga(id, {
              'status': status,
              'progress': episode
            })
              .then(res => resolve(res))
              .catch(err => reject(err))
          } else {
            this.addManga(id, {
              'status': status,
              'progress': episode
            })
              .then(res => resolve(res))
              .catch(err => reject(err))
          }
        })
    })
  }

  _isExpired (token) {
    return (Date.now() - token['created_at']) <= token['expires_in']
  }

  _requestToken () {
    return new Promise((resolve, reject) => {
      if (this.token == null || this._isExpired(this.token)) {
        request({
          url: 'https://kitsu.io/api/oauth/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grant_type: 'password',
            username: this.user,
            password: this.pass,
            client_id: this.clientId,
            client_secret: this.clientSecret
          })
        }, (err, response, body) => {
          if (err) {
            reject(err)
          } else {
            this.token = JSON.parse(body)
            resolve(this.token)
          }
        })
      } else {
        resolve(this.token)
      }
    })
  }
}

let sortResults = (result) => {
  let json = JSON.parse(result.content)
  let results = []
  let titles = []
  let sortedResults = []
  let ctr = 0
  for (let result of json['data']) {
    let title = result['attributes']['canonicalTitle'].toLowerCase()
    if (!titles.includes(title)) {
      titles.push(title)
      sortedResults[ctr++] = []
    }
  }
  for (let result of json['data']) {
    let title = result['attributes']['canonicalTitle'].toLowerCase()
    sortedResults[titles.indexOf(title)].push(result)
  }
  for (let i = 0; i < sortedResults.length; i++) {
    results.push(...sortedResults[i].sort(
      (a, b) => a['attributes']['popularityRank'] - b['attributes']['popularityRank']
    ))
  }
  return results
}

export {
  Kitsu
}
