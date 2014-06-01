expect = require('chai').expect
{Parser} = require '../src/lacona'

describe 'Parser', ->
	it 'emits "end" when done', (done) ->
		parser = new Parser()
		parser.on 'end', done
		parser.parse()