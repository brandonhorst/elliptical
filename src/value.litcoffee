#Includes

	_ = require 'lodash'

	Element = require './element'

#Value

	class Value extends Element
		constructor: (options, scope) ->
			super options
			@options = options
			@scope = scope

		handleParse: (input, lang, context, data, done) ->
			@scope[@options.compute].call context, input.text, (suggestion) =>
				{value, display} = suggestion
				output = input.handleString(display, @partOfSpeech)
				if output?
					output = output.handleValue(@id, value)
					data(output)
			, done

		suggestions: (inputString, done) ->
			throw Error("not yet implemented")

	module.exports = Value