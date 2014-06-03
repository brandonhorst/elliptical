#Includes

	require './stringshims'
	Phrase = require './phrase'
	InputOption = require './inputOption'

	{EventEmitter} = require 'events'
	async = require 'async'
	util = require 'util'
	_ = require 'lodash'


#Lacona

	class Parser extends EventEmitter
		constructor: (schemas, @options) ->
			if schemas?
				if not util.isArray(schemas)
					schemas = [schemas]
				@phrases = (new Phrase(schema) for schema in schemas)
			else
				@phrases = []

		parse: (inputText) ->
			input = new InputOption(inputText)
				
			async.each @phrases, (phrase, done) =>
				phrase
				.on 'data', (data) =>
					@emit 'data', _.cloneDeep(data)
				.on 'error', done
				.on 'end', done
				.parse input
			, (err) =>
				if err?
					@emit 'error', err
				else
					@emit 'end'

	module.exports =
		Parser: Parser
