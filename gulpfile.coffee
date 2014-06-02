gulp = require 'gulp'
util = require 'gulp-util'
mocha = require 'gulp-mocha'

gulp.task 'test', ->
	gulp
	.src 'test/**/*.coffee'
	.pipe mocha()
		.on 'error', util.log
	