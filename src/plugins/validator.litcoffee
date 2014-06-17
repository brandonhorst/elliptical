#Validator

	module.exports =
		scope:
			_validate: (inputString, data, done) ->
				@$call @validate, inputString, (err, isValid) ->
					return done(err) if err?
					if isValid
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
