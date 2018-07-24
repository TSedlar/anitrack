export const MIN_ANIME_CYCLE = (1000 * 60 * 5) // 5 mins to mark an episode as seen
export const MIN_MANGA_CYCLE = (3000) // 3 seconds per page
export const MAX_MANGA_CYCLE = (1000 * 60 * 3) // 3 mins to force a chapte as read

export class MediaHandler {
  constructor (data) {
    this.data = data
    this.acceptedURL = null
    this.baseURL = null
  }

  accept (url) {
    url = url.toLowerCase()
    for (let x in this.data['urls']) {
      let pattern = this.data['urls'][x]
      pattern = pattern.replace(/\./g, '\\.?')
      pattern = pattern.replace(/\*/g, '(.+)?')
      pattern = pattern.toLowerCase()
      if (url.match(pattern)) {
        this.acceptedURL = url
        if (this.data['base_url']) {
          this.baseURL = url.match(this.data['base_url'])[1]
        } else {
          this.baseURL = url.replace(/(\?.*)|(#.*)/g, '')
        }
        return true
      }
    }
    return false
  }

  lifeOf (cycle) {
    return (cycle.end ? cycle.end - cycle.start : new Date().getTime() - cycle.start)
  }

  verifyCycle (cycle) {
    return this.lifeOf(cycle) > (this['data']['type'] === 'anime' ? MIN_ANIME_CYCLE : MIN_MANGA_CYCLE)
  }

  parseData ($) {
    let title = processTextType($, this.data['title'], this.acceptedURL)
    let episode = processTextType($, this.data['episode'], this.acceptedURL)
    episode = parseInt(episode.match(/\d+/g), 10)
    if (this.data['type'] === 'anime') {
      return { title: title, episode: episode }
    } else {
      let page = processTextType($, this.data['page'], this.acceptedURL)
      page = parseInt(page.match(/\d+/g), 10)
      let pageCount = processTextType($, this.data['page_count'], this.acceptedURL)
      pageCount = parseInt(pageCount.match(/\d+/g), 10)
      return { title: title, episode: episode, page: page, pageCount: pageCount }
    }
  }
}

let changeProcessor = (processor) => {
  if (processor === 'number') {
    return /\d+/g
  } else {
    return processor
  }
}

let getElementText = (obj) => {
  return (obj.text ? obj.text() : obj.textContent).toString().trim()
}

let processTextType = ($, obj, acceptedURL) => {
  if (obj.toString().includes('url_regex')) {
    let pattern = obj.toString().substring(10)
    return acceptedURL.match(pattern)[1]
  }
  let out = ''
  if (obj instanceof Array) {
    for (let x in obj) {
      if (out.length > 0) {
        out += ' '
      }
      out += processTextType($, obj[x], acceptedURL)
    }
  } else if (typeof obj === 'object') {
    let element = $(obj['pattern'])
    if ('pattern-first' in element && element['pattern-first'] === true) {
      element = element.first()
    }
    let txt = getElementText(element)
    let matches = txt.match(changeProcessor(obj['processor']))
    if ('output' in obj) {
      let output = obj['output']
      let groups = obj['groups']
      for (let x in groups) {
        output = output.replace('$' + x, matches[groups[x]])
      }
      out += output
    } else {
      let groups = obj['groups']
      for (let x in groups) {
        if (x > 0) {
          out += ' '
        }
        out += matches[groups[x]]
      }
    }
  } else {
    out = getElementText($(obj))
  }
  return out.trim()
}
