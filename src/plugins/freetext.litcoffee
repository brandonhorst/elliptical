#Includes
	
	util = require 'util'
	lutil = require '../lacona-util'

#Freetext
	
	module.exports =
		scope:
			checkRegex: (inputString, data, done) ->
				if @regex
					if util.isRegExp(@regex)
						regex = new RegExp("^#{@regex.toString()[1...-1]}$")
					else
						regex = new RegExp("^#{@regex}$")

				for stringPart in lutil.splitString(inputString)
					if not regex? or stringPart.match(regex)
						data
							display: stringPart
							value: stringPart
				done()

		schema:
			name: 'freetext'
			root:
				type: 'value'
				compute: 'checkRegex'
				id: '@value'



