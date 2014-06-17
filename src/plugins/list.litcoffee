#List

	callDataOnList = (list, data, done) ->
		for entry in list
			data(entry)
		done()

	checkCache = (object, done) ->
		if object._waitingForCache
			process.nextTick ->
				checkCache object, done
		else
			done()

	module.exports =
		scope:
			collect: (inputString, data, done) ->
				if @cache?
					callDataOnList(@cache, data, done)
				else if @_waitingForCache
					checkCache @, =>
						callDataOnList(@cache, data, done)
				else
					@_waitingForCache = true
					@$call @collect, (err, list) =>
						if err?
							done(err)
						else
							@_waitingForCache = false
							@cache = list
							callDataOnList(list, data, done)

		schema:
			name: 'list'
			root:
				type: 'value'
				compute: 'collect'
				id: '@value'
