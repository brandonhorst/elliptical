#Includes

	_ = require 'lodash'

	Group = require './group'

#Repeat

	class Repeat extends Group
		constructor: (options, factory) ->
			@child = factory.create(options.child)
			@separator = factory.create(options.separator ? ' ')
			@max = options.max ? Number.MAX_VALUE ####MAX/MIN ARE NOT YET IMPLEMENTED
			@min = options.min ? Number.MIN_VALUE

		handleParse: (input, context, data, done) ->

Parse the child. If it gets data, pass the data on, then try the separator.
If the separator gets data too, loop around. If either doesn't get data, we're done.

			parsesActive = 0

			parseChild = (input) =>
				parsesActive++
				@child.parse input, context, (result) =>
					data(result)
					if _.isEmpty(result.suggestion)
						parseSeparator(result)
				, (err) =>
					if err?
						done(err)
					else
						parsesActive--
						if parsesActive is 0
							done()

			parseSeparator = (input) =>
				parsesActive++
				@separator.parse input, context, (result) =>
					parseChild(result)
				, (err) =>
					if err?
						done(err)
					else
						parsesActive--
						if parsesActive is 0
							done()

			parseChild(input)


	module.exports = Repeat