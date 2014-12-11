var gulp = require('gulp');

var browserify = require('browserify');
var glob = require('glob');
var package = require('./package');
var del = require('del');
var fs = require('fs');

var filesize = require('gulp-filesize');
var phantom = require('gulp-mocha-phantomjs');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var stylish = require('jshint-stylish');

gulp.task('phantom', function() {
	return gulp
		.src('test/**/*.html')
		.pipe(phantom({reporter: 'dot'}));
});

gulp.task('clean', function(done) {
	del(['dist', 'tmp'], done);
});

gulp.task('size', ['make'], function() {
	return gulp
		.src('dist/**/*.js')
		.pipe(filesize());
});
