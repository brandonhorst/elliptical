#Includes

	{EventEmitter} = require 'events'
	async = require 'async'
	util = require 'util'
	_ = require 'lodash'

	ElementFactory = require './element-factory'
	Phrase = require './phrase'
	InputOption = require './inputOption'

#Lacona

	class Parser extends EventEmitter
		constructor: (@options) ->
			@phrases = []
			@use require('./plugins/literal')
			@use require('./plugins/freetext')
			@use require('./plugins/integer')

		phraseAccessor: (name) =>
			_.find @phrases, (phrase) ->
				phrase.name is name

		use: (options) ->
			scope = options.scope
			schema = if options.schema? then options.schema else options
			if not util.isArray(schema)
				schema = [schema]
			for phrase in schema
				elementFactory = new ElementFactory(scope, @)
				@phrases.push new Phrase(phrase, elementFactory)
			return @


		parse: (inputText) ->
			input = new InputOption(inputText)
				
			async.each _.filter(@phrases, (item) -> item.sentence), (phrase, done) =>
				phrase.parse input, null, (result) =>
					if result.text is ''
						@emit 'data', result
				, done

			, (err) =>
				if err?
					@emit 'error', err
				else
					@emit 'end'

	module.exports =
		Parser: Parser
