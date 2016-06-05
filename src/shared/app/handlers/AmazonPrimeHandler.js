import { MediaHandler } from './MediaHandler'

const FIVE_MINUTES = (1000 * 60 * 5)

export class AmazonPrimeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('amazon.com') >= 0 && url.indexOf('/Video') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > FIVE_MINUTES
  }

  parseData (source, $) {
    let script = $('script[type="application/ld+json"]').text()
    let json = JSON.parse(script)
    let title = json.name.toLowerCase().replace('(subbed)', '').replace('(dubbed)', '').trim()
    title += ` season ${json.season.seasonNumber}`
    let episode = json.episode.episodeNumber
    return { title: title, episode: episode }
  }
}
