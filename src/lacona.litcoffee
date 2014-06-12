#Includes

	{EventEmitter} = require 'events'
	async = require 'async'
	util = require 'util'
	_ = require 'lodash'

	ElementFactory = require './element-factory'
	Phrase = require './phrase'
	InputOption = require './input-option'

#Lacona

	class Parser extends EventEmitter
		constructor: (@options) ->
			@phrases = []

			@middleware = []

			@understand require('./plugins/literal')
			@understand require('./plugins/freetext')
			@understand require('./plugins/integer')
			@understand require('./plugins/date')

		phraseAccessor: (name) =>
			_.filter @phrases, (phrase) ->
				phrase.name is name or name in phrase.extends

###`understand`

`understand` takes a schema and scope, and defines a set of words for Lacona to understand

		understand: (options) ->
			scope = options.scope
			schema = if options.schema? then options.schema else options
			if not util.isArray(schema)
				schema = [schema]
			for phrase in schema
				elementFactory = new ElementFactory(scope, @)
				@phrases.push new Phrase(phrase, scope, elementFactory)
			return @

###`use`

`use` defines middleware. It must be passed a function that accepts 2 arguments, an inputOption,
and a callback that should be passed an error (or null) and a modulated inputOption. This will be passed
to the `data` event (or the next middleware) rather than the inputOption itself.

		use: (next) ->
			@middleware.push next

		parse: (inputText) ->
			input = new InputOption(inputText)
				
			async.each _.filter(@phrases, (item) -> item.sentence), (phrase, done) =>
				phrase.parse input, null, (option) =>
					if option.text is ''
						@_applyMiddleware option, (err, finalOption) =>
							return done(err) if err?
							@emit 'data', finalOption
				, done

			, (err) =>
				if err?
					@emit 'error', err
				else
					@emit 'end'

		_applyMiddleware: (data, done) ->
			async.eachSeries @middleware, (call, done) ->
				call data, (err, newData) ->
					return done(err) if err?
					data = newData
			, (err) ->
				done(err, data)


	convertToHTML = (inputOption) ->
		html = '<div class="option">'
		html += '<span class="match">'
		for match in inputOption.match
			html += "<span class='word #{match.partOfSpeech}'>#{match.string}</span>"
		html += '</span><span class="suggestion">'
		for suggestion in inputOption.suggestion.words
			html += "<span class='word #{suggestion.partOfSpeech}'>#{suggestion.string}</span>"
		html += '</span><span class="completion">'
		for completion in inputOption.completion
			html += "<span class='word #{completion.partOfSpeech}'>#{completion.string}</span>"
		html += '</span></div>'

		return html

	module.exports =
		Parser: Parser
		convertToHTML: convertToHTML

