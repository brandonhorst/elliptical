#Includes

	require './stringshims'
	Phrase = require './phrase'
	InputOption = require './inputOption'

	{EventEmitter} = require 'events'
	async = require 'async'
	util = require 'util'


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
				phrase.parse input, (err, output) =>
					if err?
						@emit 'error', err
					if not output?
						@emit 'error', Error("Lacona Error: parse returned #{output}")
					else
						@emit 'data', JSON.parse(JSON.stringify(output))
					done()
			, (err) =>
				@emit 'end', err

	module.exports =
		Parser: Parser
