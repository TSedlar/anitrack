import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class FunimationHandler extends MediaHandler {
  accept (url) {
    return url.indexOf('funimation.com/shows') >= 0 && url.indexOf('/videos') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $('div[class*=heading]').find('h2').text().split('\n')[0]
    let episode = $('article[class*=video-description]').find('p[class*=chaner-data]').text().split(' | ')[0]
    episode = super.parseNumber(episode)
    return { title: title, episode: episode }
  }
}
