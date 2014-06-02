#Includes

	Literal = require './literal'
	Choice = require './choice'

#ParseTree

	module.exports.schemaObject = (object) ->

If it is just a string, it is interpreted as a literal with just a display property

		if typeof object == 'string' or object instanceof String
			schemaObject = new Literal
				display: object
		else
			switch object.type
				when 'literal'
					schemaObject = new Literal(object)
				when 'choice'
					schemaObject = new Choice(object)
		return schemaObject
