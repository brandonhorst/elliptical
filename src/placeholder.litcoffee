#Includes

	_ = require 'lodash'
	
	Element = require './element'
	InputOption = require './input-option'

#Placeholder

	class Placeholder extends Element
		constructor: (options, @phraseAccessor) ->
			super options
			{@type} = options
			@options = _.omit(options, 'type')

		handleParse: (input, context, data, done) ->
			oldResult = _.cloneDeep(input.result)

			phrase = @phraseAccessor(@type)

			phrase.parse input, @options, (option) =>
				value = phrase.getValue(@options, option.result)

				newOption = new InputOption(option.text, option.match, option.suggestion, option.completion, oldResult)
				newOption = newOption.handleValue(@id, value)

				data(newOption)
			, done

	module.exports = Placeholder