import * as _ from 'lodash'

const MAPPING = {
}

export class Unicode {
  static replaceChars (data) {
    _.each(MAPPING, (val, key) => {
      data = data.replace(key, val)
    })
    return data.normalize('NFKD')
  }
}
