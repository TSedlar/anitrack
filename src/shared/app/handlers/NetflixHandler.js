import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class NetflixHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('netflix.com/watch') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let parent = $('div[class*=player-status]')
    let title = parent.find('span[class*=player-status-main-title]').text()
    let episode = parent.children('span:not(.player-status-main-title)').eq(0).text()
    episode = super.parseNumber(episode.split('Ep. ')[1])
    return { title: title, episode: episode }
  }
}
