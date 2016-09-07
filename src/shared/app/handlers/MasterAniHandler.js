import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class MasterAniHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('masterani.me/anime/watch/') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $('.top .header .border').text()
    let episode = super.parseNumber($('.top .header .more').text().split('Ep. ')[1])
    return { title: title, episode: episode }
  }
}
