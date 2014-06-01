gulp = require 'gulp'
mocha = require 'gulp-mocha'

gulp.task 'test', ->
	gulp
	.src 'test/**/*.coffee'
	.pipe mocha()