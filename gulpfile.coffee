gulp = require 'gulp'
browserify = require 'gulp-browserify'
coffee = require 'gulp-coffee'
mocha = require 'gulp-mocha'
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

gulp.task 'make', ['build', 'browserify', 'uglify']


gulp.task 'build', ->
	gulp.src 'src/**/*coffee'
	.pipe coffee()
	.pipe gulp.dest 'lib'

gulp.task 'browserify', ['build'], ->
	gulp.src 'lib/lacona.js', {read: false}
	.pipe browserify {standalone: 'lacona'}
	.pipe rename('lacona.js')
	.pipe gulp.dest 'dist'

gulp.task 'uglify', ['browserify'], ->
	gulp.src 'dist/lacona.js'
	.pipe uglify()
	.pipe rename('lacona.min.js')
	.pipe gulp.dest 'dist'

