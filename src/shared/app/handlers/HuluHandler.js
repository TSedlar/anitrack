import { MediaHandler, MIN_CYCLE } from '../MediaHandler'

const REGEX = /Watch .*. Stream (.*), episode (\d+)/g

export class HuluHandler extends MediaHandler {
  accept (url) {
    return url.indexOf('hulu.com/watch') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > MIN_CYCLE
  }

  parseData (source, $) {
    let data = $('meta[name=description]').attr('content')
    let matches = REGEX.exec(data)
    if (matches) {
      let title = matches[1]
      let episode = matches[2]
      return { title: title, episode: episode }
    }
  }
}
