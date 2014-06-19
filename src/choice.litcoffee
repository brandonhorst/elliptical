#Includes

	async = require 'async'

	Group = require './group'

#Sequence

	class Choice extends Group
		constructor: (options, factory) ->
			super options
			@children = (factory.create(child) for child in options.children)

		handleParse: (input, lang, context, data, done) ->
			async.each @children, (child, done) =>
				child.parse input, lang, context, (option) =>
					newResult = option.handleValue(@id, option.result[child.id])
					data(newResult)
				, done
			, done

	module.exports = Choice