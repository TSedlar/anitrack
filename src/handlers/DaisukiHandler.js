import { MediaHandler } from './MediaHandler'

const FIVE_MINUTES = (1000 * 60 * 5)

export class DaisukiHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('daisuki.net') >= 0 && url.indexOf('anime/watch') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > FIVE_MINUTES
  }

  parseData (source, $) {
    let title = $('p[id=subTxt]').children('a').eq(1).text()
    let episode = $('h1[id=animeTitle]').text().split(' ')[0]
    episode = super.parseNumber(episode)
    return { title: title, episode: episode }
  }
}
