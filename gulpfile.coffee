gulp = require 'gulp'
browserify = require 'gulp-browserify'
clean = require 'gulp-clean'
coffee = require 'gulp-coffee'
mocha = require 'gulp-mocha'
phantom = require 'gulp-mocha-phantomjs'
rename = require 'gulp-rename'
watch = require 'gulp-watch'
uglify = require 'gulp-uglify'
util = require 'gulp-util'

paths =
	test: 'test/**/*.coffee'
	src: 'src/**/*.litcoffee'


gulp.task 'test', ->
	gulp
	.src paths.test
	.pipe mocha()
		.on 'error', util.log
	
gulp.task 'watch', ->
	gulp.src [paths.test, paths.src], { read: false }
	.pipe watch { emit: 'all' }, (files) ->
		files
		.pipe mocha {reporter: 'spec'}
		.on 'error', (err) ->
			if not /tests? failed/.test(err.stack)
				util.log err.stack
			@emit 'end'

gulp.task '_compile-tests', ->
	gulp.src 'test/**/*coffee'
	.pipe coffee()
	.pipe rename
		dirname: 'raw'
	.pipe gulp.dest 'tmp'

gulp.task '_browserify-tests', ['_compile-tests'], ->
	gulp.src 'tmp/raw/**/*.js', {read: false}
	.pipe browserify
		ignore: ['../src/lacona']
	.pipe rename
		extname: '.browserify.js'
	.pipe gulp.dest 'tmp'

gulp.task 'phantom', ['build-browser-tests'], ->
	gulp.src 'test/**/*.html'
	.pipe phantom()

gulp.task 'clean', ->
	gulp.src ['dist', 'lib', 'tmp'], {read: false}
	.pipe clean()

gulp.task 'build-browser-tests', ['_browserify-tests', 'browserify']

gulp.task 'clean-browser-tests', ->
	gulp.src 'tmp', {read: false}
	.pipe clean()

gulp.task 'make', ['uglify']


gulp.task 'build', ->
	gulp.src 'src/**/*coffee'
	.pipe coffee()
	.pipe gulp.dest 'lib'

gulp.task 'browserify', ['build'], ->
	gulp.src 'lib/lacona.js', {read: false}
	.pipe browserify
		standalone: 'lacona'
	.pipe rename('lacona.js')
	.pipe gulp.dest 'dist'

gulp.task 'uglify', ['browserify'], ->
	gulp.src 'dist/lacona.js'
	.pipe uglify()
	.pipe rename('lacona.min.js')
	.pipe gulp.dest 'dist'

