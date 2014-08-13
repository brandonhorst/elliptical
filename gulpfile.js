var gulp = require('gulp');

var browserify = require('gulp-browserify');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var package = require('./package');
var phantom = require('gulp-mocha-phantomjs');
var rename = require('gulp-rename');
var stylish = require('jshint-stylish');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var util = require('gulp-util');

gulp.task('test', function() {
	return gulp
		.src('test/**/*.js')
		.pipe(mocha({reporter: 'dot'}));
});

gulp.task('phantom', ['build-browser-tests'], function() {
	return gulp
		.src('test/**/*.html')
		.pipe(phantom({reporter: 'dot'}));
});

gulp.task('clean', function() {
	return gulp
		.src(['dist', 'tmp', 'coverage'], { read: false })
		.pipe(clean());
});

gulp.task('lint', function() {
	return gulp
		.src('lib/**/*.js')
		.pipe(jshint(package.jshintConfig))
		.pipe(jshint.reporter(stylish))
		.pipe(jshint.reporter('fail'));
});

gulp.task('build-browser-tests', ['browserify'], function() {
	return gulp
		.src('test/**/*.js', {read: false})
		.pipe(browserify({ignore: ['../src/lacona']}))
		.pipe(rename({extname: '.browserify.js'}))
		.pipe(gulp.dest('tmp'));
});

gulp.task('browserify', function() {
	return gulp
		.src('lib/lacona.js', {read: false})
		.pipe(browserify({standalone: 'lacona'}))
		.pipe(rename('lacona.js'))
		.pipe(gulp.dest('dist'));
});
gulp.task('make', ['browserify'], function() {
	return gulp
		.src('dist/lacona.js')
		.pipe(uglify())
		.pipe(rename('lacona.min.js'))
		.pipe(gulp.dest('dist'));
});