#Literal

	module.exports =
		scope:
			literal: (inputString, data, done) ->
				data
					display: @display
					value: @value
				done()

		schema:
			name: 'literal'
			root:
				type: 'value'
				compute: 'literal'



