#Includes

	_ = require 'lodash'

	Group = require './group'

#Repeat

	class Repeat extends Group
		constructor: (options, factory) ->
			super options
			@child = factory.create(options.child)
			@separator = factory.create(options.separator ? ' ')
			@max = options.max ? Number.MAX_VALUE
			@min = options.min ? Number.MIN_VALUE
			@unique = options.unique ? false

Parse the child. If it gets data, pass the data on, then try the separator.
If the separator gets data too, loop around. If either doesn't get data, we're done.
If it already has a suggestion, we're also done - we will never suggest more than one repeat

		handleParse: (input, lang, context, data, done) ->
			parsesActive = 0

			parseChild = (input, wasSuggested, level) =>
				parsesActive++
				@child.parse input, lang, context, (option) =>

					# Get the value of this repeat (or create an empty array)
					ownResult = if _.isArray(option.result[@id]) then option.result[@id] else []

					#If the child added a value, add it to the repeat's value
					childResult = option.result[@child.id]

					if @unique and childResult in ownResult
						return

					if typeof childResult isnt 'undefined'
						ownResult.push(childResult)

					#Put the modified value into the option
					newOption = option.handleValue(@id, ownResult)

					#Remove the child's value - it is covered by the repeat
					newOption = newOption.handleValue(@child.id, undefined)

					continueToSeparator = newOption.suggestion.words.length is 0 #store it, in case data changes it
					if level >= @min and level <= @max
						data(newOption)
					if level < @max and continueToSeparator
						parseSeparator(newOption, wasSuggested, level)
				, (err) =>
					if err?
						done(err)
					else
						parsesActive--
						if parsesActive is 0
							done()

			parseSeparator = (input, wasSuggested, level) =>
				parsesActive++
				@separator.parse input, lang, context, (option) =>
					parseChild(option, wasSuggested, level + 1)
				, (err) =>
					if err?
						done(err)
					else
						parsesActive--
						if parsesActive is 0
							done()

			parseChild(input, false, 1)


	module.exports = Repeat