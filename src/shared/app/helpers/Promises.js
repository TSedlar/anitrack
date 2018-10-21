import * as _ from 'lodash'

export class Promises {
  static retry (promise, args, maxTries = 3) {
    return new Promise((resolve, reject) => {
      promise.apply(this, args)
        .then((result) => resolve(result))
        .catch((err) => {
          if (maxTries <= 0) {
            return reject(err)
          }
          return this.retry(promise, args, maxTries - 1)
        })
    })
  }

  static forceAll (promises) {
    promises = promises.map(promise => new Promise((resolve, reject) => {
      promise
        .then(result => resolve(result))
        .catch(err => resolve(undefined)) // eslint-disable-line handle-callback-err
    }))
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(results => {
          let filtered = _.filter(results, (result) => result !== undefined)
          if (filtered && filtered.length > 0) {
            resolve(filtered)
          } else {
            reject('No successfully resolved promises found')
          }
        })
        .catch(err => reject(err))
    })
  }
}
