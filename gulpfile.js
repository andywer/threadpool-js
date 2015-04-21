'use strict';

var gulp    = require('gulp');
var concat  = require('gulp-concat');
var deploy  = require('gulp-gh-pages');
var jshint  = require('gulp-jshint');
var mocha   = require('gulp-mocha');
var uglify  = require('gulp-uglify');


// Fix for gulp not terminating after mocha finishes
gulp.doneCallback = function (err) {
  process.exit(err ? 1 : 0);
};


gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint());
});


gulp.task('uglify-lib', function() {
  return gulp.src('src/threadpool.js')
    .pipe(uglify())
    .pipe(concat('threadpool.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('uglify-evalworker', function() {
  return gulp.src('src/evalworker.js')
    .pipe(uglify())
    .pipe(concat('evalworker.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('uglify', ['uglify-lib', 'uglify-evalworker']);


gulp.task('test', function() {
  return gulp
    .src('spec/*.spec.js', { read: false })
    .pipe(mocha());
});


gulp.task('dist', ['lint', 'uglify']);

gulp.task('deploy-copy-dist', ['uglify'], function(done) {
  return gulp.src('dist/*')
    .pipe(gulp.dest('public'));
});

gulp.task('deploy-copy-samples', function(done) {
  return gulp.src('./samples/**')
    .pipe(gulp.dest('public/samples'));
});

gulp.task('deploy', ['dist', 'test', 'deploy-copy-dist', 'deploy-copy-samples'], function(done) {
  return gulp.src('public/**')
    .pipe(deploy());
});


gulp.task('default', ['dist', 'test']);
