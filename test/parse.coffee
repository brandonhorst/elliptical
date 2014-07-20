_ = require 'lodash'
async = require 'async'
moment = require 'moment'
chai = require 'chai'
sinon = require 'sinon'
chai.use require 'sinon-chai'

if window?.lacona?
	lacona = window.lacona
else
	lacona = require '../src/lacona'

Parser = lacona.Parser

chai.config.includeStack = true
expect = chai.expect

describe 'Parser', ->

	it 'handles without a schema (data is never called)', (done) ->
		dataCalled = sinon.spy()
		new Parser()
		.on 'data', ->
			dataCalled()
		.on 'end', ->
			expect(dataCalled).to.not.have.been.called
			done()
		.parse()


	it 'handles phrases with extension', (done) ->
		testCase =
			input: 't'
			desc: 'extension'
			schemata: [
				name: 'extended'
				root: 'test'
			,
				name: 'extender'
				extends: ['extended']
				root: 'totally'
			,
				root:
					type: 'extended'
				run: ''
			]
			matches: 2
			suggestions: ['test', 'totally']

		dataCalled = sinon.spy()
		new Parser()
		.understand testCase.schemata[0]
		.understand testCase.schemata[1]
		.understand testCase.schemata[2]
		.on 'data', (data) ->
			expect(data, testCase.desc).to.exist
			expect(testCase.suggestions, testCase.desc).to.contain data.suggestion.words[0].string
			dataCalled()
		.on 'end', ->
			expect(dataCalled, testCase.desc).to.have.callCount(testCase.matches)
			done()
		.parse testCase.input



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
				run: ''
			matches: 1
			result: {}
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
				run: ''
			suggestions: ['man']
			result: {}
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
				run: ''
			suggestions: ['man']
			result: {}
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
				run: ''
			result: {}
			suggestions: ['man', 'minnow']
			matches: 2
		,
			input: 'super m'
			desc: 'value'
			schema:
				root:
					type: 'sequence'
					children: [ 'super' , 'man' ]
					id: 'test'
					value: 'superman'
				run: ''
			result:
				test: 'superman'
			suggestions: ['man']
			matches: 1
		]

		async.each testCases, (testCase, done) ->
			dataCalled = sinon.spy()
			new Parser()
			.understand testCase.schema
			.on 'data', (data) ->
				expect(data, testCase.desc).to.exist
				expect(data.suggestion, testCase.desc).to.exist
				expect(data.suggestion.charactersComplete, testCase.desc).to.equal 1
				expect(data.suggestion.words, testCase.desc).to.have.length 1
				expect(testCase.suggestions, testCase.desc).to.contain data.suggestion.words[0].string
				expect(data.result, testCase.desc).to.deep.equal testCase.result
				dataCalled()
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.callCount(testCase.matches)
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
				run: ''
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
				run: ''
			suggestion: 'test'
			result: {}
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
				run: ''
			suggestion: 'test'
			result: {}
			matches: 1
		,
			input: 't'
			desc: '2 options with value'
			schema:
				root:
					type: 'queue'
					id: 'myId'
					children: [
						type: 'literal'
						display: 'test'
						value: 'right one'
					,
						type: 'literal'
						display: 'turbulence'
						value: 'wrong one'

					]
				run: ''
			suggestion: 'test'
			result: {myId: 'right one'}
			matches: 1
		]


		async.each testCases, (testCase, done) ->
			dataCalled = sinon.spy()
			new Parser()
			.understand testCase.schema
			.on 'data', (data) ->
				expect(data, testCase.desc).to.exist
				expect(data.suggestion, testCase.desc).to.exist
				expect(data.suggestion.charactersComplete, testCase.desc).to.equal 1
				expect(data.suggestion.words, testCase.desc).to.have.length 1
				expect(data.suggestion.words[0].string, testCase.desc).to.equal testCase.suggestion
				expect(data.result, testCase.desc).to.deep.equal testCase.result
				dataCalled()
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.callCount(testCase.matches)
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
				run: ''
			matches: 0
		,
			input: 't'
			desc: '1 occurrence'
			schema:
				root:
					type: 'repeat'
					child: 'test'
					separator: 'man'
				run: ''
			suggestion: 'test'
			result: {}
			matches: 1
		,
			input: 'test man t'
			desc: '2 occurrences'
			schema:
				root:
					type: 'repeat'
					child: 'test'
					separator: ' man '
				run: ''
			suggestion: 'test'
			result: {}
			matches: 1
		,
			input: 'test boi t'
			desc: '2 occurrences with value'
			schema:
				root:
					type: 'repeat'
					id: 'myId'
					child:
						type: 'literal'
						display: 'test'
						value: 'testVal'
					separator: ' boi '
				run: ''
			suggestion: 'test'
			result: {myId: ['testVal', 'testVal']}
			matches: 1
		]


		async.each testCases, (testCase, done) ->
			dataCalled = sinon.spy()
			new Parser()
			.understand testCase.schema
			.on 'data', (data) ->
				dataCalled()
				expect(data, testCase.desc).to.exist
				expect(data.suggestion, testCase.desc).to.exist
				expect(data.suggestion.charactersComplete, testCase.desc).to.equal 1
				expect(data.suggestion.words, testCase.desc).to.have.length 1
				expect(data.suggestion.words[0].string, testCase.desc).to.equal testCase.suggestion
				expect(data.result, testCase.desc).to.deep.equal testCase.result
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.callCount(testCase.matches)
				done()
			.parse(testCase.input)
		, done


	it 'handles schemata in different languages', (done) ->
		testCases = [
			input: 'pr'
			desc: 'basic language choice'
			schema:
				grammars: [
					lang: ['en', 'default']
					root: 'test'
				,
					lang: ['es']
					root: 'prueba'
				]
				run: ''
			matches: 1
			suggestion: 'prueba'
			language: 'es'
		,
			input: 'tr'
			desc: 'language fallback'
			schema:
				grammars: [
					lang: ['en_GB', 'default']
					root: 'lorry'
				,
					lang: ['en']
					root: 'truck'
				]
				run: ''
			matches: 1
			suggestion: 'truck'
			language: 'en_US'
		,
			input: 'pr'
			desc: 'default (browser)'
			schema:
				grammars: [
					lang: ['es']
					root: 'prueba'
				,
					lang: ['en', 'default']
					root: 'test'
				]
				run: ''
			matches: 1
			suggestion: 'prueba'
			setDefault: ->
				if window?
					window.navigator =
						language: 'es_ES'
				else if process?
					process.env.LANG = 'es_ES.UTF-8'
		]

		async.each testCases, (testCase, done) ->
			dataCalled = sinon.spy()
			if testCase.setDefault?
				testCase.setDefault()

			new Parser()
			.understand testCase.schema
			.on 'data', (data) ->
				expect(data.suggestion.words[0].string, testCase.desc).to.equal testCase.suggestion
				dataCalled()
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.callCount(testCase.matches)
				done()
			.parse(testCase.input, testCase.language)
		, done


	it 'will not throw data for an old parse', (done) ->
		testCase =
			input: 'test'
			delay:
				scope:
					delay: (result, done) ->
						process.nextTick done
				schema:
					name: 'delay'
					root: 'test'
					evaluate: 'delay'
			schema:
				root:
					type: 'delay'
				run: ''
			called: 1

		dataCalled = sinon.spy()
		new Parser()
		.understand testCase.delay
		.understand testCase.schema
		.on 'data', (data) ->
			dataCalled()
		.on 'end', ->
			expect(dataCalled).to.have.been.called.once
			done()
		.parse(testCase.input)
		.parse(testCase.input)


	it 'handles a schema with a single literal (fuzzy)', (done) ->
		testCases = [
			desc: 'basic'
			input: 'ral'
			schema:
				root: 'literal test'
				run: ''
			options:
				fuzzy: true
			matches: 1
			charactersComplete: 7
			suggestion: 'literal test'
			result: {}
		,
			desc: 'with value'
			input: 'ttt'
			schema:
				root:
					type: 'literal'
					display: 'literal test'
					value: 'test'
					id: 'theLiteral'
				run: ''
			options:
				fuzzy: true
			matches: 1
			charactersComplete: 12
			suggestion: 'literal test'
			result:
				theLiteral: 'test'
		]
		async.each testCases, (testCase, done) ->
			dataCalled = sinon.spy()

			new Parser(testCase.options)
			.understand testCase.schema
			.on 'data', (data) ->
				expect(data, testCase.desc).to.exist
				expect(data.suggestion, testCase.desc).to.exist
				expect(data.suggestion.words, testCase.desc).to.have.length 1
				expect(data.suggestion.charactersComplete, testCase.desc).to.equal testCase.charactersComplete
				expect(data.suggestion.words[0].string, testCase.desc).to.equal testCase.suggestion
				expect(data.result, testCase.desc).to.deep.equal testCase.result
				dataCalled()
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.callCount(testCase.matches)
				done()
			.parse(testCase.input)
		, done