// eslint-disable-next-line no-undef
var port = chrome.extension.connect({ name: 'Popup Communication' })

window.onload = function () {
  var user = document.getElementById('user')
  var pass = document.getElementById('pass')
  // eslint-disable-next-line no-undef
  chrome.storage.sync.get('credentials', function (storage) {
    if (storage && storage.credentials) {
      user.value = storage.credentials.username
      pass.value = storage.credentials.password // TODO: encrypt this, even though MAL API uses plaintext...
      pass.focus()
    }
  })
  var submit = document.getElementById('save')
  submit.onclick = function () {
  // eslint-disable-next-line no-undef
    chrome.storage.sync.set({ credentials: { username: user.value, password: pass.value } }, function () {
      port.postMessage({ action: 'auth' })
    })
  }
  port.onMessage.addListener(function (msg) {
    if (msg) {
      if (msg.action === 'auth') {
        if (msg.success === true) {
          pass.style.outline = '1px solid #52A0B7'
          window.close()
        } else {
          pass.style.outline = '1px solid red'
          pass.value = ''
          pass.focus()
        }
      }
    }
  })
}
