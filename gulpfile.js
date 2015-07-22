'use strict';

var gulp = require('gulp');
var convert = require('liquid-to-handlebars');
var extname = require('gulp-extname');
var through = require('through2');
var App = require('template');
var app = new App();


gulp.task('bootstrap', function () {
  gulp.src(['vendor/bootstrap-blog/**/*.md'])
    .pipe(through.obj(function (file, enc, cb) {
      var str = file.contents.toString();
      file.contents = new Buffer(convert(str));
      this.push(file);
      return cb();
    }))
    .pipe(extname('md'))
    .pipe(gulp.dest('src/blog'));
});

gulp.task('assets', function () {
  gulp.src(['vendor/bootstrap/docs/dist/**/*'])
    .pipe(gulp.dest('_gh_pages/assets'));
});

gulp.task('default', ['assets']);
