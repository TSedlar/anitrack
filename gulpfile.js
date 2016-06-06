var babelify = require('babelify')
var browserify = require('browserify')
var del = require('del')
var glob = require('glob')
var gulp = require('gulp')
var merge2 = require('merge2')
var path = require('path')
var runSequence = require('run-sequence')
var source = require('vinyl-source-stream')

function bundle (indexFile, dir, deps, cb) {
  var stream = merge2(
    browserify(indexFile, { debug: true })
      .transform(babelify)
      .bundle()
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(dir))
  )

  for (var key in deps) {
    stream.add(
      gulp.src(key)
        .pipe(gulp.dest(path.join(dir, deps[key])))
    )
  }

  stream.on('queueDrain', cb)
}

function createTasks (name) {
  gulp.task(`clean-${name}`, function () {
    return del(`./build/${name}`, { force: true })
  })

  gulp.task(`build-${name}`, function (cb) {
    bundle('./src/shared/index.js', `./build/${name}`, {
      [`./src/${name}/manifest.json`]: '',
      './src/shared/content.js': '',
      './src/shared/images/*': 'images',
      './src/shared/popup/*': 'popup'
    }, cb)
  })

  gulp.task(name, function (cb) {
    runSequence(`clean-${name}`, `build-${name}`, cb)
  })
}

createTasks('firefox')

createTasks('chrome')
