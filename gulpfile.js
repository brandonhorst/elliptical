require('coffee-script/register');

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var clean = require('gulp-clean');
var coffee = require('gulp-coffee');
var mocha = require('gulp-mocha');
var phantom = require('gulp-mocha-phantomjs');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var util = require('gulp-util');


var paths = {
	test: ['test/**/*.coffee', 'test/**/*.js'],
	src: 'src/**/*.litcoffee'
};

gulp.task('test', function() {
	return gulp
		.src(paths.test)
		.pipe(mocha());
});

gulp.task('_browserify-tests', function() {
	return gulp
		.src('test/**/*.js', {read: false})
		.pipe(browserify({ignore: ['../src/lacona']}))
		.pipe(rename({extname: '.browserify.js'}))
		.pipe(gulp.dest('tmp'));
});
gulp.task('phantom', ['build-browser-tests'], function() {
	return gulp
		.src('test/**/*.html')
		.pipe(phantom());
});
gulp.task('clean', function() {
	return gulp
		.src(['dist', 'lib', 'tmp', 'coverage'], { read: false })
		.pipe(clean());
});
gulp.task('build-browser-tests', ['_browserify-tests', 'browserify']);

gulp.task('clean-browser-tests', function() {
	return gulp
		.src('tmp', {read: false})
		.pipe(clean());
});

gulp.task('make', ['uglify']);

gulp.task('build', function() {
	return gulp
		.src('src/**/*coffee')
		.pipe(coffee())
		.pipe(gulp.dest('lib'));
});

gulp.task('browserify', ['build'], function() {
	return gulp
		.src('lib/lacona.js', {read: false})
		.pipe(browserify({standalone: 'lacona'}))
		.pipe(rename('lacona.js'))
		.pipe(gulp.dest('dist'));
});
gulp.task('uglify', ['browserify'], function() {
	return gulp
		.src('dist/lacona.js')
		.pipe(uglify())
		.pipe(rename('lacona.min.js'))
		.pipe(gulp.dest('dist'));
});