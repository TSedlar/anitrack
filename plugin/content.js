// eslint-disable-next-line no-undef
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  if (request && request.action === 'fetchSource') {
    var source = document.documentElement.outerHTML
    sendResponse({ html: source })
  } else {
    sendResponse(undefined)
  }
})
