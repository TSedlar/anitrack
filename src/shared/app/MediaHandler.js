export const MIN_CYCLE = (1000 * 60 * 5)

export class MediaHandler {
  constructor (data) {
    this.data = data
  }

  accept (url) {
    for (let x in this.data['urls']) {
      let pattern = this.data['urls'][x]
      pattern = pattern.replace(/\./g, '\\.?')
      pattern = pattern.replace(/\*/g, '(.+)?')
      if (url.match(pattern)) {
        return true
      }
    }
    return false
  }

  lifeOf (cycle) {
    return (cycle.end ? cycle.end - cycle.start : new Date().getTime() - cycle.start)
  }

  verifyCycle (cycle) {
    return this.lifeOf(cycle) > MIN_CYCLE
  }

  parseData ($) {
    let title = processTextType($, this.data['title'])
    let episode = processTextType($, this.data['episode'])
    episode = parseInt(episode.match(/\d+/g), 10)
    return { title: title, episode: episode }
  }
}

let changeProcessor = (processor) => {
  if (processor === 'number') {
    return /\d+/g
  } else {
    return processor
  }
}

let processTextType = ($, obj) => {
  let out = ''
  if (obj instanceof Array) {
    for (let x in obj) {
      if (out.length > 0) {
        out += ' '
      }
      out += processTextType($, obj[x])
    }
  } else if (typeof obj === 'object') {
    let element = $(obj['pattern'])
    if ('pattern-first' in element && element['pattern-first'] === true) {
      element = element.first()
    }
    let txt = element.text().trim()
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
    out = $(obj).text().trim()
  }
  return out.trim()
}
