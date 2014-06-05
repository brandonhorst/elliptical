#Includes

	async = require 'async'

	Group = require './group'

#Sequence

	class Choice extends Group
		constructor: (options, factory) ->
			@children = (factory.create(child) for child in options.children)

		handleParse: (input, context, data, done) ->
			async.each @children, (child, done) ->
				child.parse input, context, data, done
			, done

	module.exports = Choice