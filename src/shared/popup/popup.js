// eslint-disable-next-line no-undef
var port = chrome.runtime.connect({ name: 'Popup Communication' })

var user = document.getElementById('user')
var pass = document.getElementById('pass')
// eslint-disable-next-line no-undef
port.postMessage({ action: 'requestCreds' })
var submit = document.getElementById('save')
submit.onclick = function () {
  port.postMessage({ action: 'auth', username: user.value, password: pass.value })
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
    } else if (msg.action === 'requestCreds') {
      user.value = msg.credentials.username
      pass.value = msg.credentials.password
      pass.focus()
    }
  }
})
