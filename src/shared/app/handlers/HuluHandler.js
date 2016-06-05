import { MediaHandler } from './MediaHandler'

const FIVE_MINUTES = (1000 * 60 * 5)

const REGEX = /Watch .*. Stream (.*), episode (\d+)/g

export class HuluHandler extends MediaHandler {

  accept (url) {
    return url.indexOf('hulu.com/watch') >= 0
  }

  verify (source, cycle, $) {
    return super.lifeOf(cycle) > FIVE_MINUTES
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
