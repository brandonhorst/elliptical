#Includes

	{EventEmitter} = require 'events'
	require './stringshims'

#Phrase

	class Phrase
		constructor: (options, elementFactory) ->
			{@name, @sentence} = options
			@root = elementFactory.create(options.root)

		parse: (input, context, data, done) ->
			@root.parse input, context, (result) ->
				delete result.result[id] for id of result.result when id.startsWith '@temp'
				data(result)
			, done

	module.exports = Phrase