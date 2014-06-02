#Includes

	Value = require './value'

#Literal

	class Literal extends Value
		constructor: (options) ->
			super options
			{@display, @value} = options

		suggestions: (inputString, done) ->
			obj =
				display: @display
				value: @value

			done(null, obj)

	module.exports = Literal