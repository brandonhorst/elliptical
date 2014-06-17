#List

	module.exports =
		scope:
			collect: (inputString, data, done) ->
				if @cache?
					for entry in @cache
						data(entry)
					done()
				else
					@$call @collect, inputString, (err, list) =>
						if err?
							done(err)
						else
							@cache = list
							for entry in list
								data(entry)
							done()

		schema:
			name: 'list'
			root:
				type: 'value'
				compute: 'collect'
				id: '@value'
