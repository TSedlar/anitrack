import { MediaHandler } from './MediaHandler'

const FIVE_MINUTES = (1000 * 60 * 5)

export class MoeTubeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('moetube.net/watch/') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > FIVE_MINUTES
  }

  parseData (source, $) {
    let data = $('div[id=animename]').find('h2').text().split(' · ')
    let title = data[0]
    let episode = super.parseNumber(data[1])
    return { title: title, episode: episode }
  }
}
