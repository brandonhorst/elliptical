async = require 'async'
chai = require 'chai'
spies = require 'chai-spies'
{Parser} = require '../src/lacona'

chai.config.includeStack = true
chai.use spies
expect = chai.expect

describe 'Parser', ->
	it 'emits "end" when done', (done) ->
		new Parser()
		.on 'end', ->
			done()
		.parse()

	it 'never emits "data" with no schemata', (done) ->
		new Parser()
		.on 'data', ->
			throw Error("data was triggered")
		.on 'end', done
		.parse()

	it 'handles a schema with a single literal properly', (done) ->
		literalSchemata = [
			root: 'literal test'
		,
			root:
				type: 'literal'
				display: 'literal test'
		]
		async.each literalSchemata, (schema, done) ->
			dataCalled = chai.spy()

			new Parser(schema)
			.on 'data', (data) ->
				expect(data).to.exist
				expect(data.suggestion).to.exist
				expect(data.suggestion.words).to.have.length 1
				expect(data.suggestion.charactersComplete).to.equal 1
				expect(data.suggestion.words[0].string).to.equal 'literal test'
				dataCalled()
			.on 'end', ->
				expect(dataCalled).to.have.been.called.once
				done()
			.parse('l')
		, done

	it 'handles a schema with a choice (1 correct)', (done) ->
		dataCalled = chai.spy()
		new Parser
			root:
				type: 'choice'
				children: [
					'choice test'
					'wrong answer'
				]
		.on 'data', (data) ->
			expect(data).to.exist
			expect(data.suggestion).to.exist
			expect(data.suggestion.words).to.have.length 1
			expect(data.suggestion.charactersComplete).to.equal 1
			expect(data.suggestion.words[0].string).to.equal 'choice test'
			dataCalled()	
		.on 'end', ->
			expect(dataCalled).to.have.been.called.once
			done()
		.parse('c')

	it 'handles a schema with a choice (multiple correct)', (done) ->
		dataCalled = chai.spy()
		new Parser
			root:
				type: 'choice'
				children: [
					'choice test'
					'canon in C'
				]
		.on 'data', (data) ->
			expect(data).to.exist
			expect(data.suggestion).to.exist
			expect(data.suggestion.words).to.have.length 2
			expect(data.suggestion.charactersComplete).to.equal 1
			choiceStrings = (word.string for word in data.suggestion.words)
			expect(choiceStrings).to.contain 'choice test'
			expect(choiceStrings).to.contain 'canon in C'
			dataCalled()	
		.on 'end', ->
			expect(dataCalled).to.have.been.called.twice
			done()
		.parse('c')