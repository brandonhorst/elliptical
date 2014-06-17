#Literal

	module.exports =
		scope:
			_validate: (inputString, data, done) ->
				if @$call(@validate, inputString)
					data
						display: inputString
						value: inputString
				done()

		schema:
			name: 'validator'
			root:
				type: 'value'
				compute: '_validate'
				id: '@value'
