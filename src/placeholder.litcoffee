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

			@phraseAccessor(@type).parse(input, @options, data, done)

	module.exports = Placeholder