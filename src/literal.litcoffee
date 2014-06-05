#Literal

	module.exports =
		scope:
			literal: (inputString, suggestion, done) ->
				suggestion
					display: @display
					value: @value
				done(null)

		schema:
			name: 'literal'
			root:
				type: 'value'
				compute: 'literal'



