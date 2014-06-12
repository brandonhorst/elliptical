#Includes

	_ = require 'lodash'
	async = require 'async'
	
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

			phrases = @phraseAccessor(@type)

			async.each phrases, (phrase, done) =>
				phrase.parse input, @options, (option) =>
					value = phrase.getValue(@options, option.result)

					newOption = new InputOption(option.text, option.match, option.suggestion, option.completion, oldResult)
					newOption = newOption.handleValue(@id, value)

					data(newOption)
				, done
			, done

	module.exports = Placeholder