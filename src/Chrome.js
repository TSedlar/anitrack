export class Chrome {

  static getCurrentTabURL () {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs === undefined || tabs[0] === undefined) {
          reject('undefined tab')
        } else {
          resolve(tabs[0].url)
        }
      })
    })
  }

  static getPageSource () {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // eslint-disable-next-line no-undef
        chrome.tabs.sendMessage(tabs[0].id, { action: 'fetchSource' }, (response) => {
          if (response && response.html) {
            resolve(response.html)
          } else {
            reject('content is not injected')
          }
        })
      })
    })
  }
}
