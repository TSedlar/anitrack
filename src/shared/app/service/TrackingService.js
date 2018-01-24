import { Roman } from '../helpers/Roman'
import { Promises } from '../helpers/Promises'
import { Unicode } from '../helpers/Unicode'

class TrackingService {
  constructor () {
    this.user = null
    this.password = null
  }

  authenticate (user, pass) {
    this.user = user
    this.pass = pass
  }

  verifyCredentials () {}

  api (suffix) {}

  anime (suffix) {}

  animelist (suffix) {}

  manga (suffix) {}

  mangalist (suffix) {}

  addAnime (id, json) {}

  updateAnime (id, json) {}

  addManga (id, json) {}

  updateManga (id, json) {}

  search (apiURL, query) {}

  findListEntry (id, type = 'anime') {}

  checkEpisode (id, type = 'anime') {}

  updateAnimeList (id, status, episode) {}

  useAPI (apiURL, json) {}

  resolveAnimeSearch (title) {
    let titles = this.findNormalTitles(title)
    return new Promise((resolve, reject) => {
      Promises.forceAll(titles.map(aTitle => this.searchAnime(aTitle)))
        .then(results => resolve(results[0]))
        .catch(err => reject(err))
    })
  }

  findNormalTitles (title) {
    let lower = title.toLowerCase()
    let season = -1
    let seasonRegex = /season (\d+)/g
    let matches = seasonRegex.exec(lower)
    let titles = []
    let baseTitle = null
    if (matches) {
      season = matches[1]
      baseTitle = lower.replace('(', '').replace(')', '').replace(`season ${season}`, '').trim()
      baseTitle = Unicode.replaceChars(baseTitle)
      if (parseInt(season) === 1) {
        titles.push(baseTitle)
      } else {
        titles.push(`${baseTitle} season ${season}`)
        titles.push(`${baseTitle} ${Roman.romanize(season)}`)
        titles.push(baseTitle)
      }
    } else {
      let splits = lower.split(' ')
      let roman = splits[splits.length - 1]
      let result = Roman.deromanize(roman)
      if (result) {
        season = result
        baseTitle = splits.slice(0, -1).join(' ')
        baseTitle = Unicode.replaceChars(baseTitle)
        if (parseInt(season) === 1) {
          titles.push(baseTitle)
        } else {
          titles.push(`${baseTitle} ${roman}`)
          titles.push(`${baseTitle} season ${season}`)
          titles.push(baseTitle)
        }
      }
    }
    if (season === -1) {
      titles.push(Unicode.replaceChars(title))
    }
    return titles
  }
}

export {
  TrackingService
}
