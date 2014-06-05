#Includes

	{EventEmitter} = require 'events'

#Element

	class Element
		constructor: (options) ->
			@id = options.id
			@optional = options.optional ? false

			delete options.id
			delete options.optional

		parse: (input, context, data, done) ->
			if @optional
				data(input)

			@handleParse(input, context, data, done)

Abstract method handleParse

		handleParse: (input, context, data, done) =>
			throw Error('You must override abstract method handlParse')

	module.exports = Element