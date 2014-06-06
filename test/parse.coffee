_ = require 'lodash'
async = require 'async'
chai = require 'chai'
spies = require 'chai-spies'
{Parser} = require '../src/lacona'

chai.config.includeStack = true
chai.use spies
expect = chai.expect

describe 'Parser', ->

	it 'handles without a schema (data is never called)', (done) ->
		dataCalled = chai.spy()
		new Parser()
		.on 'data', ->
			dataCalled()
		.on 'end', ->
			expect(dataCalled).to.not.have.been.called()
			done()
		.parse()

	it 'handles a schema with a single literal properly', (done) ->
		testCases = [
			schema:
				root: 'literal test'
				sentence: true
			matches: 1
			suggestion: 'literal test'
		,
			schema:
				root:
					type: 'literal'
					display: 'literal test'
				sentence: true
			matches: 1
			suggestion: 'literal test'
		]
		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()

			new Parser()
			.use testCase.schema
			.on 'data', (data) ->
				expect(data).to.exist
				expect(data.suggestion).to.exist
				expect(data.suggestion.words).to.have.length 1
				expect(data.suggestion.charactersComplete).to.equal 1
				expect(data.suggestion.words[0].string).to.equal testCase.suggestion
				dataCalled()
			.on 'end', ->
				expect(dataCalled).to.have.been.called.exactly(testCase.matches)
				done()
			.parse('l')
		, done

	it 'handles a schema with a choice', (done) ->
		testCases = [
			input: 'test'
			desc: '0 matches'
			schema:
				root:
					type: 'choice'
					children: [
						'super'
						'man'
					]
				sentence: true
			matches: 0
		,
			input: 't'
			desc: '1 match'
			schema:
				root:
					type: 'choice'
					children: [
						'super'
						'test'
					]
					separator: ' test '
				sentence: true
			matches: 1
			results: ['test']
		,
			input: 't'
			desc: '2 matches'
			schema:
				root:
					type: 'choice'
					children: [
						'test'
						'turbulence'
					]
					separator: ''
				sentence: true
			matches: 2
			results: ['test', 'turbulence']
		]
		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.use testCase.schema
			.on 'data', (data) ->
				expect(data).to.exist
				expect(data.suggestion).to.exist
				expect(data.suggestion.charactersComplete).to.equal 1
				expect(data.suggestion.words).to.have.length 1
				expect(testCase.results).to.contain data.suggestion.words[0].string
				dataCalled()	
			.on 'end', ->
				expect(dataCalled).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done

	it 'handles a schema with a sequence', (done) ->
		testCases = [
			desc: 'Default separator (" ")'
			input: 'super m'
			schema:
				root:
					type: 'sequence'
					children: [
						'super'
						'man'
					]
				sentence: true
			matches: 1
			suggestions: ['man']
		,
			input: 'super test m'
			desc: 'String separator'
			schema:
				root:
					type: 'sequence'
					children: [
						'super'
						'man'
					]
					separator: ' test '
				sentence: true
			suggestions: ['man']
			matches: 1
		,
			input: 'superm'
			desc: 'empty separator'
			schema:
				root:
					type: 'sequence'
					children: [
						'super'
						'man'
					]
					separator: ''
				sentence: true
			suggestions: ['man']
			matches: 1
		,
			input: 'superm'
			desc: 'optional child'
			schema:
				root:
					type: 'sequence'
					children: [
						'super'
					,
						type: 'literal'
						optional: true
						display: 'minnow'
					,
						'man'
					]
					separator: ''
				sentence: true
			suggestions: ['man', 'minnow']
			matches: 2
		]

		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.use testCase.schema
			.on 'data', (data) ->
				expect(data, testCase.desc).to.exist
				expect(data.suggestion, testCase.desc).to.exist
				expect(data.suggestion.charactersComplete, testCase.desc).to.equal 1
				expect(data.suggestion.words, testCase.desc).to.have.length 1
				expect(testCase.suggestions).to.contain data.suggestion.words[0].string
				dataCalled()
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done

	it 'handles a schema with a queue', (done) ->
		testCases = [
			input: 't'
			desc: '0 matches'
			schema:
				root:
					type: 'queue'
					children: [
						'super'
						'man'
					]
				sentence: true
			matches: 0
		,
			input: 't'
			desc: '1 match'
			schema:
				root:
					type: 'queue'
					children: [
						'super'
						'test'
					]
				sentence: true
			result: 'test'
			matches: 1
		,
			input: 't'
			desc: '2 options - pick first'
			schema:
				root:
					type: 'queue'
					children: [
						'test'
						'turbulence'
					]
				sentence: true
			result: 'test'
			matches: 1
		]


		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.use testCase.schema
			.on 'data', (data) ->
				expect(data, testCase.desc).to.exist
				expect(data.suggestion, testCase.desc).to.exist
				expect(data.suggestion.charactersComplete, testCase.desc).to.equal 1
				expect(data.suggestion.words, testCase.desc).to.have.length 1
				expect(data.suggestion.words[0].string, testCase.desc).to.equal testCase.result
				dataCalled()
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done


	it 'handles a schema with a repeat', (done) ->
		testCases = [
			input: 't'
			desc: '0 occurrences'
			schema:
				root:
					type: 'repeat'
					child: 'super'
					separator: 'man'
				sentence: true
			matches: 0
		,
			input: 't'
			desc: '1 occurrence'
			schema:
				root:
					type: 'repeat'
					child: 'test'
					separator: 'man'
				sentence: true
			result: 'test'
			matches: 1
		,
			input: 'test man t'
			desc: '2 occurrences'
			schema:
				root:
					type: 'repeat'
					child: 'test'
					separator: ' man '
				sentence: true
			result: 'test'
			matches: 1
		]


		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.use testCase.schema
			.on 'data', (data) ->
				dataCalled()
				expect(data, testCase.desc).to.exist
				expect(data.suggestion, testCase.desc).to.exist
				expect(data.suggestion.charactersComplete, testCase.desc).to.equal 1
				expect(data.suggestion.words, testCase.desc).to.have.length 1
				expect(data.suggestion.words[0].string, testCase.desc).to.equal testCase.result
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done



	it 'handles a schema with a freetext', (done) ->
		testCases = [
			input: 'anything'
			desc: 'anything'
			schema:
				root:
					type: 'freetext'
				sentence: true
			result: 'anything'
			matches: 1
		,
			input: 'anything'
			desc: 'regex (accepted)'
			schema:
				root:
					type: 'freetext'
					regex: /anything/
				sentence: true
			result: 'anything'
			matches: 1
		,
			input: 'anything'
			desc: 'regex (rejected)'
			schema:
				root:
					type: 'freetext'
					regex: /nothing/
				sentence: true
			matches: 0
		,
			input: 'anything'
			desc: 'string regex'
			schema:
				root:
					type: 'freetext'
					regex: 'anything'
				sentence: true
			result: 'anything'
			matches: 1
		]


		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.use testCase.schema
			.on 'data', (data) ->
				dataCalled()
				expect(data, testCase.desc).to.exist
				expect(data.match, testCase.desc).to.exist
				expect(data.match, testCase.desc).to.have.length 1
				expect(data.match[0].string, testCase.desc).to.equal testCase.result
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done



	it 'handles a freetext in a sequence', (done) ->
		testCase =
			input: 'anything'
			desc: 'anything'
			schema:
				root:
					type: 'sequence'
					separator: null
					children: [
						type: 'freetext'
					,
						'thing'
					]
				sentence: true
			result: ['any', 'thing']
			matches: 2


		dataCalled = chai.spy()

		new Parser()
		.use testCase.schema
		.on 'data', (data) ->
			dataCalled()
			expect(data, testCase.desc).to.exist
			expect(data.match, testCase.desc).to.exist
			if data.suggestion.words.length > 0
				expect(data.match[0].string, testCase.desc).to.equal testCase.input
				expect(data.suggestion.words[0].string, testCase.desc).to.equal testCase.schema.root.children[1]
			else
				for i in [0...testCase.result.length]
					expect(data.match[i].string, testCase.desc).to.equal testCase.result[i]
		.on 'end', ->
			expect(dataCalled, testCase.desc).to.have.been.called.exactly(testCase.matches)
			done()
		.parse(testCase.input)

	it 'handles an integer', (done) ->
		testCases = [
			input: '1234'
			desc: 'valid'
			schema:
				root:
					type: 'integer'
				sentence: true
			result: '1234'
			matches: 1
		,
			input: '12b4'
			desc: 'invalid'
			schema:
				root:
					type: 'integer'
				sentence: true
			matches: 0
		]

		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.use testCase.schema
			.on 'data', (data) ->
				console.log data
				dataCalled()
				expect(data, testCase.desc).to.exist
				expect(data.match, testCase.desc).to.exist
				expect(data.match[0].string, testCase.desc).to.equal testCase.result
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done