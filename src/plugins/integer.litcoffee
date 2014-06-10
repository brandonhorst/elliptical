#Includes

	lutil = require '../lacona-util'

#Integer
		
	module.exports =
		scope:
			integer: (inputString, data, done) ->
				for stringPart in lutil.splitString(inputString)
					if stringPart.match(/^\d+$/)
						integer = parseInt(stringPart)
						if not isNaN(integer) and (not @max? or integer <= @max) and (not @min? or integer >= @min)
							data
								display: stringPart
								value: integer
				done()

		schema:
			name: 'integer'
			root:
				type: 'value'
				compute: 'integer'
				id: '@value'

