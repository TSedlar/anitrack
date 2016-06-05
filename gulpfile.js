var gulp = require('gulp')
var source = require('vinyl-source-stream')
var browserify = require('browserify')
var babel = require('babelify')
var glob = require('glob')
var path = require('path')
var del = require('del')
var fs = require('fs')

function bundle (indexFile, dir, deps, endHandler) {
  var bundler = browserify(indexFile, { debug: true }).transform(babel)
  var stream = bundler.bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(dir))
  for (var key in deps) {
    stream = gulp.src(glob.sync(key))
      .pipe(gulp.dest(path.join(dir, deps[key])))
  }
  stream.on('end', function () {
    var obj = {}
    obj.replace = function (file, replacement) {
      var absolute = path.join(dir, file)
      fs.unlinkSync(absolute)
      fs.writeFileSync(absolute, fs.readFileSync(replacement))
      return obj
    }
    if (endHandler) {
      endHandler(obj)
    }
  })
}

function createFirefoxTasks (dir) {
  gulp.task('clean-firefox', function () {
    del(dir)
  })
  gulp.task('build-firefox', function () {
    bundle('./src/firefox/index.js', dir, {
      './src/firefox/meta/*': '',
      './src/firefox/meta/images/*': 'images/'
    })
  })
}

function createChromeTasks (dir) {
  gulp.task('clean-chrome', function () {
    del(dir)
  })
  gulp.task('build-chrome', function () {
    bundle('./src/firefox/index.js', dir, {
      './src/firefox/meta/*': '',
      './src/firefox/meta/images/*': 'images/'
    }, function (bundle) {
      bundle.replace('manifest.json', './src/chrome/meta/manifest.json')
    })
  })
}

function createCleanBuildTask (name) {
  gulp.task(name, [`clean-${name}`, `build-${name}`])
}

createFirefoxTasks('./firefox-extension/')
createCleanBuildTask('firefox')

createChromeTasks('./chrome-extension/')
createCleanBuildTask('chrome')
