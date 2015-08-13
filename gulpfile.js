'use strict';

var gulp       = require('gulp');
var babel      = require('gulp-babel');
var browserify = require('browserify');
var concat     = require('gulp-concat');
var deploy     = require('gulp-gh-pages');
var eslint     = require('gulp-eslint');
var mocha      = require('gulp-mocha');
var source     = require('vinyl-source-stream');
var uglify     = require('gulp-uglify');


// Fix for gulp not terminating after mocha finishes
gulp.doneCallback = function (err) {
  process.exit(err ? 1 : 0);
};


gulp.task('lint', function() {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});


gulp.task('babel', function() {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('lib/'));
});


gulp.task('browserify', ['babel'], function() {
  return browserify('./lib/index.js')
    .bundle()
    .pipe(source('threadpool.js'))
    .pipe(gulp.dest('dist/'));
});


gulp.task('uglify-lib', ['browserify'], function() {
  return gulp.src('dist/threadpool.js')
    .pipe(uglify())
    .pipe(concat('threadpool.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('uglify-evalworker', ['babel'], function() {
  return gulp.src('lib/evalworker.js')
    .pipe(uglify())
    .pipe(concat('evalworker.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('uglify', ['uglify-lib', 'uglify-evalworker']);


gulp.task('dist', ['lint', 'browserify', 'uglify']);


gulp.task('test', ['dist'], function() {
  return gulp
    .src('spec/*.spec.js', { read: false })
    .pipe(mocha());
});

gulp.task('deploy-copy-dist', ['uglify'], function() {
  return gulp.src('dist/*')
    .pipe(gulp.dest('public'))          // just for backward compatibility
    .pipe(gulp.dest('public/dist'));
});

gulp.task('deploy-copy-samples', function() {
  return gulp.src('./samples/**')
    .pipe(gulp.dest('public/samples'));
});

gulp.task('deploy', ['dist', 'test', 'deploy-copy-dist', 'deploy-copy-samples'], function() {
  return gulp.src('public/**')
    .pipe(deploy());
});


gulp.task('default', ['dist', 'test']);
