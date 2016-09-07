import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class HTVAnimeHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('htvanime.com') >= 0 && url.indexOf('episode') >= 0
  }

  verify (source, cycle, $) {
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
    episode = super.parseNumber(episode)
    return { title: title, episode: episode }
  }
}
