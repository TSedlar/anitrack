var gulp = require('gulp')
var source = require('vinyl-source-stream')
var browserify = require('browserify')
var babel = require('babelify')
var glob = require('glob')
var path = require('path')
var del = require('del')

var OUT_DIR = './lib/'

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

gulp.task('clean', function () {
  del(OUT_DIR)
})

gulp.task('build', function () {
  bundle('./src/index.js', OUT_DIR, {
    './plugin/*': '',
    './plugin/images/*': 'images/'
  })
})

gulp.task('default', ['clean', 'build'])
