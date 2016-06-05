import { MediaHandler } from './MediaHandler'

const FIVE_MINUTES = (1000 * 60 * 5)

export class GoGoAnimeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('gogoanime.io') >= 0 && url.indexOf('episode') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > FIVE_MINUTES
  }

  parseData (source, $) {
    let data = $('meta[name=description]').attr('content').split(' Episode ')
    console.log(JSON.stringify(data))
    let title = data[0]
    let episode = super.parseNumber(data[1])
    return { title: title, episode: episode }
  }
}
