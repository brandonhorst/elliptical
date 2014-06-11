Create a new parser

	console.log lacona
	
	parser = new lacona.Parser()

Input some sample sentences

	parser.use
		root:
			type: 'choice'
			children: [
				'test'
				'totally'
				'tempest'
			]
		sentence: true

Respond to parses

	parser.on 'data', (data) ->
		for suggestionField in suggestionFields
			suggestionField.innerHTML += lacona.convertToHTML(data)
	.on 'end', ->

Set up events

	inputs = document.getElementsByClassName('input')
	for input in inputs
		input.onkeyup = ->
			for suggestionField in suggestionFields
				suggestionField.innerHTML = ''
			parser.parse(@value)

	suggestionFields = document.getElementsByClassName('suggestions')


