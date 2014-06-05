#Includes

	# Literal = require './literal'
	Choice = require './choice'
	Sequence = require './sequence'
	Repeat = require './repeat'
	Queue = require './queue'

	Phrase = require './phrase'
	Value = require './value'
	Placeholder = require './placeholder'

#ParseTree

	class ElementFactory
		constructor: (@scope, @lacona) ->
		
Create an object from a JSON representation.
If it is just a string, it is interpreted as a literal with just a display property

		create: (object) ->
			if typeof object is 'string' or object instanceof String
				trueObject =
					type: 'literal'
					display: object
			else
				trueObject = object

			switch trueObject.type
				when 'value'
					element = new Value(trueObject, @scope)
				when 'choice'
					element = new Choice(trueObject, @)
				when 'sequence'
					element = new Sequence(trueObject, @)
				when 'repeat'
					element = new Repeat(trueObject, @)
				when 'queue'
					element = new Queue(trueObject, @)
				else
					element = new Placeholder(trueObject, @lacona.phraseAccessor)

			return element

	module.exports = ElementFactory