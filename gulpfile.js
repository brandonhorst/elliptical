var gulp = require('gulp');

var async = require('async');
var browserify = require('browserify');
var exec = require('child_process').exec;
var glob = require('glob');
var merge = require('merge-stream');
var package = require('./package');
var path = require('path');
var rimraf = require('rimraf');

var filesize = require('gulp-filesize');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var phantom = require('gulp-mocha-phantomjs');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
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

gulp.task('clean', function(done) {
	async.each(['dist', 'tmp'], function (dir, done) {
		rimraf(dir, done);
	}, done)
});

gulp.task('size', ['make'], function() {
	return gulp
		.src('dist/**/*.js')
		.pipe(filesize());
});

gulp.task('lint', function() {
	return gulp
		.src('lib/**/*.js')
		.pipe(jshint(package.jshintConfig))
		.pipe(jshint.reporter(stylish))
		.pipe(jshint.reporter('fail'));
});

gulp.task('build-browser-tests', ['browserify'], function() {
	glob('./test/**/*.js', function(err, files) {
		if (err) {
			throw err;
		} else {
			var ify = browserify()
			for (var i = 0; i < files.length; i++) {
				ify.add(files[i]);
			}
			ify
				.ignore('../lib/lacona')
				.bundle()
				.pipe(source('tests.js'))
				.pipe(gulp.dest('tmp'));
		}
	});
});

gulp.task('make', function() {
	return browserify({standalone: 'lacona'})
		.add('./lib/lacona.js')
		.bundle()
		.pipe(source('lacona.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename('lacona.min.js'))
		.pipe(streamify(uglify()))
		.pipe(gulp.dest('dist'));

	//This could should work, but I'm not going to get into filesize opt yet

	// var noLodash = browserify({standalone: 'lacona'})
	// 	.add('./lib/lacona.js')
	// 	.ignore('lodash')
	// 	.bundle()
	// 	.pipe(source('lacona.external-lodash.js'))
	// 	.pipe(gulp.dest('dist'))
	// 	.pipe(rename('lacona.external-lodash.min.js'))
	// 	.pipe(streamify(uglify()))
	// 	.pipe(gulp.dest('dist'));

	// var noAsync = browserify({standalone: 'lacona'})
	// 	.add('./lib/lacona.js')
	// 	.ignore('async')
	// 	.bundle()
	// 	.pipe(source('lacona.external-async.js'))
	// 	.pipe(gulp.dest('dist'))
	// 	.pipe(rename('lacona.external-async.min.js'))
	// 	.pipe(streamify(uglify()))
	// 	.pipe(gulp.dest('dist'));

	// var noLodashNoAsync = browserify({standalone: 'lacona'})
	// 	.add('./lib/lacona.js')
	// 	.ignore('lodash')
	// 	.ignore('async')
	// 	.bundle()
	// 	.pipe(source('lacona.external-lodash-async.js'))
	// 	.pipe(gulp.dest('dist'))
	// 	.pipe(rename('lacona.external-lodash-async.min.js'))
	// 	.pipe(streamify(uglify()))
	// 	.pipe(gulp.dest('dist'));

	// return merge(lacona, noLodash, noAsync, noLodashNoAsync);

});