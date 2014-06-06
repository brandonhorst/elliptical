gulp = require 'gulp'
util = require 'gulp-util'
mocha = require 'gulp-mocha'
watch = require 'gulp-watch'

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
		.pipe mocha()
		.on 'error', (err) ->
			if not /tests? failed/.test(err.stack)
				util.log err.stack
