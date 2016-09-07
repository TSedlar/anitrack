import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class AmazonPrimeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('amazon.com') >= 0 && url.indexOf('/dp/') >= 0
  }

  verify (source, cycle, $) {
    return $('script[type="application/ld+json"]').length && super.lifeOf(cycle) > MIN_CYCLE
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
