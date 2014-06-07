#Includes

	async = require 'async'

	Group = require './group'

#Sequence

	class Choice extends Group
		constructor: (options, factory) ->
			super options
			@children = (factory.create(child) for child in options.children)

		handleParse: (input, context, data, done) ->
			async.each @children, (child, done) =>
				child.parse input, context, (result) =>
					if result.result[child.id]?
						result.result[@id] = result.result[child.id]
					data(result)
				, done
			, done

	module.exports = Choice