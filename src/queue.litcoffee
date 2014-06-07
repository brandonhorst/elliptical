#Includes

	async = require 'async'
	util = require 'util'

	Group = require './group'

#Queue

	class Queue extends Group
		constructor: (options, factory) ->
			super options
			@children = (factory.create(child) for child in options.children)

		handleParse: (input, context, data, done) ->

If we get data, stop iterating by passing a true, which will be detected in the callback.
true is not an error, and the completion handler for the eachSeries call will detect this.

			async.eachSeries @children, (child, done) =>
				hasData = false

				child.parse input, context, (result) =>
					hasData = true
					if result.result[child.id]?
						result.result[@id] = result.result[child.id]
					data(result)
				, (err) =>
					if err?
						done(err)
					else
						done(if hasData then true else null)

If it's an actual error, pass it through.
If not, then it is the true that we passed through to stop iteration, and just call end.

			, (err) =>
				if err? and util.isError(err)
					done(err)
				else
					done()

	module.exports = Queue