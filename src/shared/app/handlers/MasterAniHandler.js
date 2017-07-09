import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class MasterAniHandler extends MediaHandler {
  accept (url) {
    return url.indexOf('masterani.me/anime/watch/') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $('.top .info .details h1').text()
    let episode = super.parseNumber($('.top .info .details h2').text().trim().split('Episode ')[1])
    return { title: title, episode: episode }
  }
}
