#Includes

	Group = require './group'

#Sequence

	class Sequence extends Group
		constructor: (options) ->
			{@children} = options

		parse: (input, next) ->
			functions = (child.parse(input, done) for child in @children)
			async.waterfall functions, next