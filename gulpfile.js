const { src, dest, parallel,series } = require('gulp');
const pug = require('gulp-pug');
const less = require('gulp-less');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
//const eslint = require('gulp-eslint');

function html() {
  return src('html/*.pug')
    .pipe(pug())
    .pipe(dest('build'))
}

function css() {
  return src('client/templates/*.less')
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(dest('build'))
}

function js() {
  return src('js/*.js', { sourcemaps: true })
    .pipe(concat('app.min.js'))
    .pipe(dest('build', { sourcemaps: true }))
}


exports.js = js;
exports.css = css;
exports.html = html;
exports.default = parallel(html, css, js);