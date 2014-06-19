#Includes

	_ = require 'lodash'
	util = require 'util'

	Group = require './group'

#Repeat

	class Repeat extends Group
		constructor: (options, factory) ->
			super options
			@child = factory.create(options.child)
			@separator = factory.create(options.separator ? ' ')
			@max = options.max ? Number.MAX_VALUE ####MAX/MIN ARE NOT YET IMPLEMENTED
			@min = options.min ? Number.MIN_VALUE

		handleParse: (input, lang, context, data, done) ->

Parse the child. If it gets data, pass the data on, then try the separator.
If the separator gets data too, loop around. If either doesn't get data, we're done.
If it already has a suggestion, we're also done - we will never suggest more than one repeat

			parsesActive = 0

			parseChild = (input) =>
				parsesActive++
				@child.parse input, lang, context, (option) =>
					newResult = if util.isArray(option.result[@id]) then option.result[@id] else []
					if typeof option.result[@child.id] isnt 'undefined'
						newResult.push option.result[@child.id]
					newOption = option.handleValue(@id, newResult)
					newOption = newOption.handleValue(@child.id, undefined)

					continueToSeparator = newOption.suggestion.words.length is 0 #store it, in case data changes it
					data(newOption)
					if continueToSeparator
						parseSeparator(newOption)
				, (err) =>
					if err?
						done(err)
					else
						parsesActive--
						if parsesActive is 0
							done()

			parseSeparator = (input) =>
				parsesActive++
				@separator.parse input, lang, context, (option) =>
					parseChild(option)
				, (err) =>
					if err?
						done(err)
					else
						parsesActive--
						if parsesActive is 0
							done()

			parseChild(input)


	module.exports = Repeat