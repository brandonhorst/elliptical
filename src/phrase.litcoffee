#Includes

	{EventEmitter} = require 'events'
	_ = require 'lodash'
	require './stringshims'

#Phrase

	class Phrase
		constructor: (options, @scope, elementFactory) ->
			{@name, @evaluate, @run} = options
			@extends = options.extends ? []
			@precedes = options.precedes ? []

			@grammars = {}
			if options.grammars?
				for grammar in options.grammars
					langs = if _.isArray(grammar.lang) then grammar.lang else [grammar.lang]
					for lang in langs
						@grammars[lang] = elementFactory.create(grammar.root)
			else
				@grammars.default = elementFactory.create(options.root)

		parse: (input, lang, context, data, done) ->
			node = @grammars[lang] ? @grammars[lang.split('_')[0]] ? @grammars.default
			node.parse input, lang, context, (result) ->
				delete result.result[id] for id of result.result when id.startsWith '@temp'
				data(result)
			, done

		getValue: (options, result, done) ->
			if @evaluate?
				@scope[@evaluate].call(options, result, done)
			else
				done(null, result['@value'])

			

	module.exports = Phrase