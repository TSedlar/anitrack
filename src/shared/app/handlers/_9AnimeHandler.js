import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

export class _9AnimeHandler extends MediaHandler {
  accept (url) {
    return (url.indexOf('9anime.to') >= 0 || url.indexOf('9anime.is') >= 0) && url.indexOf('watch') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let title = $("h1[class='title']").text()
    let episode = parseInt($("ul[class~='episodes'] > li > a[class='active']").text())
    return { title: title, episode: episode }
  }
}
