#Includes

	async = require 'async'
	util = require 'util'

	Group = require './group'

#Sequence

	class Choice extends Group
		constructor: (options, factory) ->
			super options
			@children = (factory.create(child) for child in options.children)
			if options.limit?
				@limit = options.limit
			else
				@limit = 0

		handleParse: (input, lang, context, data, done) ->

			if @limit == 0
				async.each @children, (child, done) =>
					child.parse input, lang, context, (option) =>
						newResult = option.handleValue(@id, option.result[child.id])
						data(newResult)
					, done
				, done
			else
				#If we get data, stop iterating by passing a true, which will be detected in the callback.
				#true is not an error, and the completion handler for the eachSeries call will detect this.
				hitCount = 0
				async.eachSeries @children, (child, done) =>
					hasData = false

					child.parse input, lang, context, (option) =>
						hitCount += 1
						newResult = option.handleValue(@id, option.result[child.id])
						data(newResult)
					, (err) =>
						if err?
							done(err)
						else
							done(if hitCount >= @limit then true else null)

				#If it's an actual error, pass it through.
				#If not, then it is the true that we passed through to stop iteration, and just call end.
				, (err) =>
					if err? and util.isError(err)
						done(err)
					else
						done()

	module.exports = Choice