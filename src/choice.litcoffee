#Includes

	async = require 'async'

	Group = require './group'
	schemaUtil = require './schema-util'

#Sequence

	class Choice extends Group
		constructor: (options) ->
			@children = (schemaUtil.schemaObject(child) for child in options.children)

		parse: (input, next) ->
			async.each @children, (child, done) ->
				child.parse input, (err, output) ->
					if err?
						next(err)
					else if output?
						next(null, output)
					done()

	module.exports = Choice