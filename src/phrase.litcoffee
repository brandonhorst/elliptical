#Includes

	schemaUtil = require './schema-util'

#Phrase

	class Phrase
		constructor: (options) ->
			@lang = options?.lang
			@root = schemaUtil.schemaObject(options.root)
		parse: (input, done) ->
			@root.parse(input, done)

	module.exports = Phrase