import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class AnimeHavenHandler extends MediaHandler {
  accept (url) {
    return url.indexOf('animehaven.org') >= 0 && url.indexOf('episode') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let data = $('h1[class*=entry-title]').text().split(' – Episode ')
    let title = data[0]
    let episode = super.parseNumber(data[1])
    return { title: title, episode: episode }
  }
}
