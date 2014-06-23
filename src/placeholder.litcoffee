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
				currentlyInData = 0
				doneCalled = false
				phrase.parse input, lang, @options, (option) =>
					currentlyInData++
					phrase.getValue @options, option.result, (err, value) =>
						newOption = option.replaceResult(oldResult)
						newOption = newOption.handleValue(@id, value)

						data(newOption)
						currentlyInData--
						if currentlyInData is 0 and doneCalled
							done()

				, (err) ->
					if err?
						done(err)
					else if currentlyInData is 0
						done()
					else
						doneCalled = true
			, done

	module.exports = Placeholder