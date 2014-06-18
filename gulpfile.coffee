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

gulp.task 'prepublish', ['browserify', 'build']


gulp.task 'browserify', ->
	gulp.src 'src/lacona.litcoffee', {read: false}
	.pipe browserify
		transform: ['coffeeify']
		extensions: ['.coffee', '.litcoffee']
		standalone: 'lacona'
	# .pipe uglify()
	.pipe rename 'lacona.min.js'
	.pipe gulp.dest 'browser'

gulp.task 'build', ->
	gulp.src 'src/**/*coffee'
	.pipe coffee()
	.pipe gulp.dest 'lib'
