import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class KissAnimeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('kissanime.to') >= 0 && url.indexOf('episode-') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $('div[id=navsubbar]').find('a').text().trim()
    title = title.split('\n')[1].trim()
    if (title && title.endsWith('(Sub)')) {
      title = title.replace('(Sub)', '').trim()
    } else if (title && title.endsWith('(Dub)')) {
      title = title.replace('(Dub)', '').trim()
    }
    let episode = $('#selectEpisode option:selected').text()
    episode = super.parseNumber(episode.replace('\n', '').trim())
    return { title: title, episode: episode }
  }
}
