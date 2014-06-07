#Includes

	_ = require 'lodash'
	
	Element = require './element'

#Placeholder

	class Placeholder extends Element
		constructor: (options, @phraseAccessor) ->
			super options
			{@type} = options
			@options = _.omit(options, 'type')

		handleParse: (input, context, data, done) ->
			oldResult = input.result
			input.result = {}

			@phraseAccessor(@type).parse input, @options, (result) =>
				if @id?
					if result.result['@value']?
						oldResult[@id] = result.result['@value']
						result.result = oldResult
				data(result)
			, done

	module.exports = Placeholder