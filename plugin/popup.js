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
      window.close()
    })
  }
}
