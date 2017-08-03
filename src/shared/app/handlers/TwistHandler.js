import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class TwistHandler extends MediaHandler {
  accept (url) {
    return url.indexOf('twist.moe/a/') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $('.video-data .information .series-title h2').text()
    let episode = $('.video-data .information .series-episode .ep span').text()
    return { title: title, episode: episode }
  }
}
