import { MediaHandler } from './MediaHandler'

const FIVE_MINUTES = (1000 * 60 * 5)

export class CrunchyrollHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('crunchyroll.com') >= 0 && url.indexOf('episode') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > FIVE_MINUTES
  }

  parseData (source, $) {
    let parent = $('div[id=showmedia_about_media]')
    let title = parent.find('a[class*=text-link]').text()
    let episode = parent.find('h4[id!=showmedia_about_episode_num]').text().toLowerCase()
    episode = episode.substring(episode.indexOf('episode'))
    episode = super.parseNumber(episode)
    return { title: title, episode: episode }
  }
}
