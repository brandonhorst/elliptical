var gulp = require('gulp');
var _ = require('lodash');

var browserify = require('browserify');
var glob = require('glob');
var package = require('./package');
var del = require('del');

var filesize = require('gulp-filesize');
var phantom = require('gulp-mocha-phantomjs');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');

gulp.task('phantom', ['build-browser-tests'], function() {
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

gulp.task('lint', function() {
	return gulp
		.src('lib/**/*.js')
		.pipe(jshint(package.jshintConfig))
		.pipe(jshint.reporter(stylish))
		.pipe(jshint.reporter('fail'));
});

gulp.task('lint-misc', function () {
	return gulp
		.src(['test/**/*.js', 'gulpfile.js'])
		.pipe(jshint(_.merge(package.jshintConfig, package.jshintConfigMisc)))
		.pipe(jshint.reporter(stylish))
		.pipe(jshint.reporter('fail'));
});

gulp.task('build-browser-tests', ['make'], function() {
	glob('./test/**/*.js', function(err, files) {
		if (err) {
			throw err;
		} else {
			var ify = browserify();
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

});
