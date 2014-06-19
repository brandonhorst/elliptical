#Includes

	_ = require 'lodash'
	async = require 'async'
	
	Element = require './element'
	InputOption = require './input-option'

#Placeholder

	class Placeholder extends Element
		constructor: (options, scope, @phraseAccessor) ->
			super options
			{@type} = options
			@options = _.omit(options, 'type')
			@options.$call = (func, args...) =>
				scope[func].apply(@options, args)

		handleParse: (input, lang, context, data, done) ->
			oldResult = _.cloneDeep(input.result)

			phrases = @phraseAccessor(@type)

			async.each phrases, (phrase, done) =>
				phrase.parse input, lang, @options, (option) =>
					value = phrase.getValue(@options, option.result)

					newOption = option.replaceResult(oldResult)
					newOption = newOption.handleValue(@id, value)

					data(newOption)
				, done
			, done

	module.exports = Placeholder