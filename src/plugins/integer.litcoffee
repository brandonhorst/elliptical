#Includes

#Integer
		
	module.exports =
		scope:
			toInt: (result) ->
				return parseInt(result.integer)

		schema:
			name: 'integer'
			evaluate: 'toInt'
			root:
				type: 'freetext'
				regex: /\d+/
				id: 'integer'

