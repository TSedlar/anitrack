// eslint-disable-next-line no-undef
var port = chrome.runtime.connect({ name: 'Popup Communication' })
var user = document.getElementById('user')
var pass = document.getElementById('pass')
port.postMessage({ action: 'requestCreds' })
var service = document.getElementById('service')
var submit = document.getElementById('save')
submit.onclick = function () {
  port.postMessage({
    action: 'auth',
    username: user.value,
    password: pass.value,
    service: service.options[service.selectedIndex].value
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
    } else if (msg.action === 'requestCreds') {
      user.value = msg.credentials.username
      pass.value = msg.credentials.password
      service.value = msg.credentials.service
      pass.focus()
    }
  }
})
