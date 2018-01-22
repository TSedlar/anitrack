import { TrackingService } from './TrackingService'

import * as _ from 'lodash'

const request = require('request')

const key = 'b369ea828fbb0e931c4960d554a28c0c9169abc7632f3683c7f28b9811715429'

class Kitsu extends TrackingService {
  authorization () {
    // const joined = `${this.user}:${this.pass}`
    // const b64 = Buffer.from(joined).toString('base64')
    // return `Basic ${b64}`
    return `Bearer ${key}`
  }

  useAPI (apiURL, type, json = {}) {
    return new Promise((resolve, reject) => {
      request({
        url: apiURL,
        method: type,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
          'Authorization': this.authorization(),
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
  }

  // since kitsu is using a public secret key until they finish their API,
  // this is going to always be true.
  verifyCredentials () {
    return new Promise((resolve, reject) => {
      resolve({ responseCode: 200 })
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

  _addType (id, type) {
    return new Promise((resolve, reject) => {
      this._findUid()
        .then(uid => {
          this.useAPI(this.animelist(''), 'POST', this._formApiObj(uid, id, {
            'data': {
              'attributes': { 'progress': 1 }
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
    return this._addType(id, 'anime')
  }

  updateAnime (id, attributes) {
    return this._updateType(id, 'anime', attributes)
  }

  addManga (id, json = {}) {
    return this._addType(id, 'manga')
  }

  updateManga (id, attributes) {
    return this._updateType(id, 'manga', attributes)
  }

  search (apiURL, query) {
    return new Promise((resolve, reject) =>
      this.useAPI(apiURL + `filter[text]=${query}`, 'GET')
        .then((result) => {
          let json = JSON.parse(result.content)
          resolve(json['data'][0])
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
}

export {
  Kitsu
}
