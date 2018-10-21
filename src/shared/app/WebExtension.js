let lastTab = null

export class WebExtension {
  static getCurrentTab () {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs === undefined || tabs.length === 0 || tabs[0] === undefined) {
          if (lastTab) {
            resolve(lastTab)
          } else {
            reject('undefined tab')
          }
        } else {
          lastTab = tabs[0]
          resolve(lastTab)
        }
      })
    })
  }

  static getCurrentTabURL () {
    return new Promise((resolve, reject) => {
      this.getCurrentTab()
        .then(tab => resolve(tab.url))
        .catch(err => reject(err))
    })
  }

  static getPageSource (tabId) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      chrome.tabs.executeScript(tabId, {
        code: '(' + function () {
          return { html: document.documentElement.outerHTML }
        } + ')();'
      }, (results) => {
        resolve(results[0].html)
      })
    })
  }

  static getCurrentPageSource () {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      this.getCurrentTab()
        .then(tab => {
          this.getPageSource(tab.id)
            .then(source => resolve(source))
            .catch(err => reject(err))
        })
        .catch(err => reject(err))
    })
  }
}
