#Includes

#Element

	class Element
		@tempId: 0

		constructor: (options) ->
			@id = options.id ? '@temp-' + (++@constructor.tempId)
			@optional = options.optional ? false

		parse: (input, lang, context, data, done) ->
			if @optional
				data(input)

			@handleParse(input, lang, context, data, done)

Abstract method handleParse

		handleParse: (input, lang, context, data, done) =>
			throw Error('You must override abstract method handleParse')

	module.exports = Element