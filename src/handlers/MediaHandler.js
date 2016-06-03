export class MediaHandler {

  accept (url) {
    return false
  }

  verify (source, $) {
    return true
  }

  parseData (source, $) {
    return null
  }
}
