#Includes

	{EventEmitter} = require 'events'


#Phrase

	class Phrase
		constructor: (options, elementFactory) ->
			{@name, @sentence} = options
			@root = elementFactory.create(options.root)

		parse: (input, context, data, done) ->
			@root.parse input, context, data, done

	module.exports = Phrase