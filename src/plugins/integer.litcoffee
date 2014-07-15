#Includes

	lutil = require '../lacona-util'

#Integer
		
	module.exports =
		scope:
			integer: (inputString, data, done) ->
				integerRegex = /^(?:\d{1,3})(?:,?(?:(?:\d{3}),?)*?(?:\d{3}))?$/

				for stringPart in lutil.splitString(inputString)
					if stringPart.match(integerRegex)
						for match in stringPart.match(integerRegex)
							matchCommaStripped = match.split(",").join("")
							integer = parseInt(matchCommaStripped)
							if not isNaN(integer) and (not @max? or integer <= @max) and (not @min? or integer >= @min)
								data
									display: match
									value: integer
				done()


		schema:
			name: 'integer'
			root:
				type: 'value'
				compute: 'integer'
				id: '@value'

