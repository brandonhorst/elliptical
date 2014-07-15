#Includes

	lutil = require '../lacona-util'

#Integer
		
	module.exports =
		scope:
			integer: (inputString, data, done) ->

#integerRegex

```
^					- the start of the string followed by
	(?:				- a non-capturing group of
		0			- zero followed by
		$			- the end of the string
	)
	|				- or
	(?:				- a non-capturing group of
		[1-9]		- the set of numbers 1-9 followed by
		\d{0,2}		- between zero and 2 digits
	)				- followed by
	(?:				- an optional non-capturing group of
		(?:			- zero or more non-capturing groups of
			,		- a comma followed by
			\d{3}	- 3 digits
		)*
		|			- or
		\d*			- zero or more digits
	)?				- followed by
$					- the end of the string
```

				integerRegex = /^(?:0$)|(?:[1-9]\d{0,2})(?:(?:,\d{3})*|\d*)?$/

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

