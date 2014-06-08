#Includes

	_ = require 'lodash'
	
	Element = require './element'
	InputOption = require './inputOption'

#Placeholder

	class Placeholder extends Element
		constructor: (options, @phraseAccessor) ->
			super options
			{@type} = options
			@options = _.omit(options, 'type')

		handleParse: (input, context, data, done) ->
			oldResult = _.cloneDeep(input.result)

			@phraseAccessor(@type).parse input, @options, (option) =>
				newOption = new InputOption(option.text, option.match, option.suggestion, option.completion, oldResult)
				newOption = newOption.handleValue(@id, option.result['@value'])
				data(newOption)
			, done

	module.exports = Placeholder