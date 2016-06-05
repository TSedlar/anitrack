var gulp = require('gulp')
var source = require('vinyl-source-stream')
var browserify = require('browserify')
var babel = require('babelify')
var glob = require('glob')
var path = require('path')
var del = require('del')

function bundle (indexFile, dir, deps) {
  var bundler = browserify(indexFile, { debug: true }).transform(babel)
  bundler.bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(dir))
  for (var key in deps) {
    gulp.src(glob.sync(key))
      .pipe(gulp.dest(path.join(dir, deps[key])))
  }
}

function createExtensionTasks (name, dir) {
  gulp.task(`clean-${name}`, function () {
    del(dir)
  })
  gulp.task(`build-${name}`, function () {
    var args = {}
    args[`./src/${name}/meta/*`] = ''
    args[`./src/${name}/meta/images/*`] = 'images/'
    bundle(`./src/${name}/index.js`, dir, args)
  })
}

function createCleanBuildTask (name) {
  gulp.task(name, [`clean-${name}`, `build-${name}`])
}

createExtensionTasks('chrome', './chrome-extension/')
createCleanBuildTask('chrome')
