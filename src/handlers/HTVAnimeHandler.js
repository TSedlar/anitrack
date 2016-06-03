import { MediaHandler } from './MediaHandler'

export class HTVAnimeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('htvanime.com') >= 0 && url.indexOf('episode') >= 0
  }

  verify (source, $) {
    return $('md-checkbox[class*=watched]').attr('aria-checked') === 'true'
  }

  parseData (source, $) {
    let title = $('span[class*=crumb]').text()
    if (title && title.endsWith('(Sub)')) {
      title = title.replace('(Sub)', '').trim()
    } else if (title && title.endsWith('(Dub)')) {
      title = title.replace('(Dub)', '').trim()
    }
    let episode = $('div[class*=release-date]').text()
    episode = parseInt(episode.match(/\d+/g))
    return { title: title, episode: episode }
  }
}
