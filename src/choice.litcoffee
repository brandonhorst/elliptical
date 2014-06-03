#Includes

	async = require 'async'

	Group = require './group'
	schemaUtil = require './schema-util'

#Sequence

	class Choice extends Group
		constructor: (options) ->
			@children = (schemaUtil.schemaObject(child) for child in options.children)

		parse: (input, next) ->
			async.each @children, (child, done) =>
				child
				.on 'data', (data) =>
					@emit 'data', data
				.on 'error', done
				.on 'end', done
				.parse input
			, (err) =>
				if err?
					@emit 'error', err
				else
					@emit 'end'

	module.exports = Choice