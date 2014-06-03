#Includes

	{EventEmitter} = require 'events'

#Element

	class Element extends EventEmitter
		constructor: (options) ->
			{@id, @optional} = options

	module.exports = Element