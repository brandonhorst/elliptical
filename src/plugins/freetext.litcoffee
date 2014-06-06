#Includes
	
	util = require 'util'

#Freetext
	
	module.exports =
		scope:
			checkRegex: (inputString, data, done) ->
				if @regex
					if util.isRegExp(@regex)
						regex = new RegExp("^#{@regex.toString()[1...-1]}$")
					else
						regex = new RegExp("^#{@regex}$")

				for i in [0...inputString.length]
					stringPart = inputString[..i]
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


