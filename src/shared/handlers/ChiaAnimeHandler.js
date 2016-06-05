import { MediaHandler } from './MediaHandler'

const FIVE_MINUTES = (1000 * 60 * 5)

export class ChiaAnimeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('chia-anime.tv') >= 0 && url.indexOf('episode') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > FIVE_MINUTES
  }

  parseData (source, $) {
    let title = $('div[id=schema]').find('a').text()
    let episode = $('h1[itemprop=episodeNumber]').text().split(title + ' ')[1]
    episode = episode.split('Episode ')[1].split(' ')[0]
    episode = super.parseNumber(episode)
    return { title: title, episode: episode }
  }
}
