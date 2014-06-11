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
			@understand require('./plugins/literal')
			@understand require('./plugins/freetext')
			@understand require('./plugins/integer')
			@understand require('./plugins/date')

		phraseAccessor: (name) =>
			_.find @phrases, (phrase) ->
				phrase.name is name

		understand: (options) ->
			scope = options.scope
			schema = if options.schema? then options.schema else options
			if not util.isArray(schema)
				schema = [schema]
			for phrase in schema
				elementFactory = new ElementFactory(scope, @)
				@phrases.push new Phrase(phrase, scope, elementFactory)
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

