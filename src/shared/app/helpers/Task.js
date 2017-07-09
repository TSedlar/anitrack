class Task {
  constructor (func, timeout) {
    this.func = func
    this.timeout = timeout
    this.alive = true
  }

  start () {
    if (this.alive) {
      setTimeout(() => {
        this.func()
        this.start()
      }, this.timeout)
    }
  }
}

export {
  Task
}
