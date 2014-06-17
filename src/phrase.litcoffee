#Includes

	{EventEmitter} = require 'events'
	require './stringshims'

#Phrase

	class Phrase
		constructor: (options, @scope, elementFactory) ->
			{@name, @evaluate, @run} = options
			@extends = options.extends ? []
			@precedes = options.precedes ? []
			@root = elementFactory.create(options.root)

		parse: (input, context, data, done) ->
			@root.parse input, context, (result) ->
				delete result.result[id] for id of result.result when id.startsWith '@temp'
				data(result)
			, done

		getValue: (options, result) ->
			if @evaluate?
				return @scope[@evaluate].call(options, result)
			else
				return result['@value']

			

	module.exports = Phrase