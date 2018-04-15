window.onload = function () {
  // eslint-disable-next-line no-undef
  var port = chrome.runtime.connect({ name: 'Popup Communication' })
  var user = document.getElementById('user')
  var pass = document.getElementById('pass')
  var status = document.getElementById('status')
  var service = document.getElementById('service')
  var submit = document.getElementById('save')

  port.postMessage({ action: 'requestCreds' })

  submit.onclick = function () {
    status.textContent = 'Authenticating..'
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
          status.textContent = 'Logged in'
          pass.style.outline = '1px solid #52A0B7'
          window.close()
        } else {
          status.textContent = 'Login failed'
          pass.style.outline = '1px solid red'
          pass.value = ''
          pass.focus()
        }
      } else if (msg.action === 'requestCreds') {
        status.textContent = 'Logged in'
        user.value = msg.credentials.username
        pass.value = msg.credentials.password
        service.value = msg.credentials.service
        pass.focus()
      }
    }
  })
}
