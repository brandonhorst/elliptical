#Suggester

	module.exports =
		scope:
			suggest: (inputString, data, done) ->
				data
					display: inputString
					value: inputString

				suggestion = @$call @suggest, inputString, (err, suggestion) ->
					return done(err) if err?
					data
						display: suggestion
						value: suggestion
				done()

		schema:
			name: 'suggester'
			root:
				type: 'value'
				compute: 'suggest'
				id: '@value'
