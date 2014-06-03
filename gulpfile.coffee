gulp = require 'gulp'
util = require 'gulp-util'
mocha = require 'gulp-mocha'

paths =
	test: 'test/**/*.coffee'
	src: 'src/**/*.litcoffee'


gulp.task 'test', ->
	gulp
	.src paths.test
	.pipe mocha()
		.on 'error', util.log
	
gulp.task 'watch', ->
	gulp.watch paths.test, ['test']
	gulp.watch paths.src, ['test']