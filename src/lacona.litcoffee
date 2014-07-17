#Includes

	_ = require 'lodash'
	async = require 'async'
	{EventEmitter} = require 'events'
	util = require 'util'

	ElementFactory = require './element-factory'
	Phrase = require './phrase'
	InputOption = require './input-option'

#Lacona

	class Parser extends EventEmitter
		constructor: (options) ->

			@optionsForInput = _.pick(options, 'fuzzy')
			@options = _.omit(options, 'fuzzy')

			@phrases = []

			@middleware = []

			@understand require('./literal')

			@currentParseNumber = 0

		_phraseAccessor: (name) =>
			_.filter @phrases, (phrase) ->
				phrase.name is name or name in phrase.extends

###`understand`

`understand` takes a schema and scope, and defines a set of words for Lacona to understand

		understand: (options) ->
			scope = options.scope
			schema = options.schema ? options
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
			return @

###`parse`

		parse: (inputText, lang) ->
			lang = lang ? window?.navigator?.language?.replace?('-', '_') ? process?.env?.LANG?.split?('.')?[0] ? 'default' #ALL THE QUESTION MARKS
			@currentParseNumber++
			thisParseNumber = @currentParseNumber

			phraseIsSentence = (item) ->
				item.run?

			gotData = (phrase, done) =>
				input = new InputOption(@optionsForInput, phrase, inputText)
				phrase.parse input, lang, null, (option) =>
					if option.text is '' and thisParseNumber is @currentParseNumber
						async.eachSeries @middleware, (call, done) =>
							call option, done
						, (err) =>
							return done(err) if err?
							@emit 'data', option
				, done

			allPhrasesDone = (err) =>
				if err?
					@emit 'error', err
				else if thisParseNumber is @currentParseNumber
					@emit 'end'

			async.each _.filter(@phrases, phraseIsSentence), gotData, allPhrasesDone

			return @

	run = (inputOption, done) ->
		inputOption.sentence.scope[inputOption.sentence.run](inputOption.result, done)

	nextText = (inputOption, done) ->
		match = _.reduce inputOption.match, (string, match) ->
			return string + match.string
		, ''

		matchAndSuggestion = _.reduce inputOption.suggestion.words, (string, suggestion) ->
			return string + suggestion.string
		, match

		done(null, matchAndSuggestion)


	module.exports =
		Parser: Parser
		run: run
		nextText: nextText
