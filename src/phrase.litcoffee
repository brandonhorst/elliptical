#Includes

	{EventEmitter} = require 'events'

	schemaUtil = require './schema-util'

#Phrase

	class Phrase extends EventEmitter
		constructor: (options) ->
			{@lang} = options
			@root = schemaUtil.schemaObject(options.root)
		parse: (input) ->
			@root
			.on 'data', (data) =>
				@emit 'data', data
			.on 'error', (err) =>
				@emit 'err', err
			.on 'end', =>
				@emit 'end'
			.parse input

	module.exports = Phrase