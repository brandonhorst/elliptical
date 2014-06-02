#Includes

	Element = require './element'

#Value

	class Value extends Element
		constructor: (options) ->
			super options

		parse: (input, next) ->
			@suggestions input.text, (err, suggestion) ->
				{value, display} = suggestion
				output = input.handleString(display, @partOfSpeech, @id, value)
				next(null, output)

		suggestions: (inputString, done) ->
			throw Error("not yet implemented")

	module.exports = Value