_ = require 'lodash'
async = require 'async'
moment = require 'moment'
chai = require 'chai'
chai.use require 'chai-spies'
chai.use require 'chai-datetime'

{Parser} = require '../src/lacona'

chai.config.includeStack = true
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
			input: 'l'
			schema:
				root: 'literal test'
				run: ''
			matches: 1
			suggestion: 'literal test'
			result: {}
		,
			input: 'l'
			schema:
				root:
					type: 'literal'
					display: 'literal test'
				run: ''
			matches: 1
			suggestion: 'literal test'
			result: {}
		,
			input: 'l'
			schema:
				root:
					type: 'literal'
					display: 'literal test'
					value: 'test'
					id: 'theLiteral'
				run: ''
			matches: 1
			suggestion: 'literal test'
			result:
				theLiteral: 'test'
		]
		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()

			new Parser()
			.understand testCase.schema
			.on 'data', (data) ->
				expect(data).to.exist
				expect(data.suggestion).to.exist
				expect(data.suggestion.words).to.have.length 1
				expect(data.suggestion.charactersComplete).to.equal 1
				expect(data.suggestion.words[0].string).to.equal testCase.suggestion
				expect(data.result).to.deep.equal testCase.result
				dataCalled()
			.on 'end', ->
				expect(dataCalled).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done

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

		dataCalled = chai.spy()
		new Parser()
		.understand testCase.schemata[0]
		.understand testCase.schemata[1]
		.understand testCase.schemata[2]
		.on 'data', (data) ->
			expect(data, testCase.desc).to.exist
			expect(testCase.suggestions, testCase.desc).to.contain data.suggestion.words[0].string
			dataCalled()
		.on 'end', ->
			expect(dataCalled, testCase.desc).to.have.been.called.exactly(testCase.matches)
			done()
		.parse testCase.input


	it 'handles a schema with a validator', (done) ->
		testCases = [
			input: 'test'
			desc: 'success'
			schema:
				root:
					type: 'validator'
					validate: 'validate'
					id: 'testId'
				run: ''
			scope:
				validate: (input, done) ->
					process.nextTick ->
						done(null, input is 'test')
			result:
				testId: 'test'
			matches: 1
		,
			input: 'test'
			desc: 'failure'
			schema:
				root:
					type: 'validator'
					validate: 'validate'
					id: 'testId'
				run: ''
			scope:
				validate: (input, done) ->
					done(null, input isnt 'test')
			matches: 0

		]
		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.understand {scope: testCase.scope, schema: testCase.schema}
			.on 'data', (data) ->
				expect(data, testCase.desc).to.exist
				expect(data.match, testCase.desc).to.exist
				expect(data.match, testCase.desc).to.have.length 1
				expect(data.match[0].string, testCase.desc).to.equal testCase.input
				expect(data.result, testCase.desc).to.deep.equal testCase.result
				dataCalled()	
			.on 'end', ->
				expect(dataCalled).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done

	it 'handles a schema with a suggester', (done) ->
		testCases = [
			input: 'test'
			desc: 'suggester'
			schema:
				root:
					type: 'suggester'
					suggest: 'suggest'
					id: 'testId'
				run: ''
			scope:
				suggest: (input, done) ->
					process.nextTick ->
						done(null, "#{input} and more")
			result1:
				testId: 'test'
			result2:
				testId: 'test and more'
			suggestion2: 'test and more'
			matches: 2
		]
		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.understand {scope: testCase.scope, schema: testCase.schema}
			.on 'data', (data) ->
				expect(data, testCase.desc).to.exist
				if data.match.length > 0
					expect(data.match, testCase.desc).to.have.length 1
					expect(data.match[0].string, testCase.desc).to.equal testCase.input
					expect(data.result, testCase.desc).to.deep.equal testCase.result1
				else
					expect(data.suggestion.words, testCase.desc).to.have.length 1
					expect(data.suggestion.words[0].string, testCase.desc).to.equal testCase.suggestion2
					expect(data.result, testCase.desc).to.deep.equal testCase.result2
				dataCalled()	
			.on 'end', ->
				expect(dataCalled).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done

	it 'handles a schema with a list', (done) ->
		testCase =
			input: 'test'
			desc: 'list'
			schema:
				root:
					type: 'list'
					collect: 'collect'
					id: 'testId'
				run: ''
			scope:
				collect: chai.spy (done) ->
					process.nextTick ->
						done null, [
							display: 'test'
							value: 'test value'
						,
							display: 'tesla'
							value: 'tesla motors'
						]
			result:
				testId: 'test value'

		dataCalled = chai.spy()
		new Parser()
		.understand {scope: testCase.scope, schema: testCase.schema}
		.parse(testCase.input) #parse twice, to verify that caching works
		.on 'data', (data) ->
			expect(data, testCase.desc).to.exist
			expect(data.match, testCase.desc).to.exist
			expect(data.match, testCase.desc).to.have.length 1
			expect(data.match[0].string, testCase.desc).to.equal testCase.input
			expect(data.result, testCase.desc).to.deep.equal testCase.result
			dataCalled()	
		.on 'end', ->
			expect(testCase.scope.collect, testCase.desc).to.have.been.called.once
			expect(dataCalled, testCase.desc).to.have.been.called.above(0)
			if dataCalled.__spy.calls.length is 2
				done()
		.parse(testCase.input)


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
				run: ''
			matches: 0
			result: {}
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
				run: ''
			matches: 1
			suggestions: ['test']
			result: {}
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
				run: ''
			matches: 2
			suggestions: ['test', 'turbulence']
			result: {}
		,
			input: 't'
			desc: 'results'
			schema:
				root:
					type: 'choice'
					id: 'theChoice'
					children: [
						type: 'literal'
						display: 'test'
						value: 'should be'
					,
						type: 'literal'
						display: 'nope'
						value: 'wrong'
					]
				run: ''
			matches: 1
			suggestions: ['test']
			result:
				theChoice: 'should be'
		]
		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
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
			dataCalled = chai.spy()
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
			dataCalled = chai.spy()
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
			dataCalled = chai.spy()
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
				run: ''
			result: 'anything'
			matches: 1
		,
			input: 'anything'
			desc: 'regex (accepted)'
			schema:
				root:
					type: 'freetext'
					regex: /anything/
				run: ''
			result: 'anything'
			matches: 1
		,
			input: 'anything'
			desc: 'regex (rejected)'
			schema:
				root:
					type: 'freetext'
					regex: /nothing/
				run: ''
			matches: 0
		,
			input: 'anything'
			desc: 'string regex'
			schema:
				root:
					type: 'freetext'
					regex: 'anything'
				run: ''
			result: 'anything'
			matches: 1
		]


		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.understand testCase.schema
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
						regex: /any/
						id: 'test'
					,
						'thing'
					]
				run: ''
			match: ['any', 'thing']
			result:
				test: 'any'
			matches: 1


		dataCalled = chai.spy()

		new Parser()
		.understand testCase.schema
		.on 'data', (data) ->
			dataCalled()
			expect(data, testCase.desc).to.exist
			expect(data.match, testCase.desc).to.exist
			for i in [0...testCase.match.length]
				expect(data.match[i].string, testCase.desc).to.equal testCase.match[i]
			expect(data.result, testCase.desc).to.deep.equal testCase.result
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
					id: 'test'
				run: ''
			match: '1234'
			result:
				test: 1234
			matches: 1
		,
			input: '12b4'
			desc: 'invalid'
			schema:
				root:
					type: 'integer'
				run: ''
			matches: 0
		,
			input: '12'
			desc: 'more than max'
			schema:
				root:
					type: 'integer'
					max: 10
				run: ''
			matches: 0
		,
			input: '12'
			desc: 'less than min'
			schema:
				root:
					type: 'integer'
					min: 15
				run: ''
			matches: 0
		,
			input: '12'
			desc: 'single number (max and min are inclusive)'
			schema:
				root:
					type: 'integer'
					max: 12
					min: 12
					id: 'test'
				run: ''
			match: '12'
			result: 
				test: 12
			matches: 1
		]

		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.understand testCase.schema
			.on 'data', (data) ->
				dataCalled()
				expect(data, testCase.desc).to.exist
				expect(data.match, testCase.desc).to.exist
				expect(data.match[0].string, testCase.desc).to.equal testCase.match
				expect(data.result).to.deep.equal testCase.result
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done

	it 'handles an date (complete)', (done) ->
		testCases = [
			input: 'today'
			desc: 'today'
			schema:
				root:
					type: 'date'
					id: 'test'
				run: ''
			result:
				test: moment({hour: 0}).toDate()
			matches: 1
		,
			input: 'tomorrow'
			desc: 'tomorrow'
			schema:
				root:
					type: 'date'
					id: 'test'
				run: ''
			result:
				test: moment({hour: 0}).add(1, 'd').toDate()
			matches: 1
		,
			input: 'the day after tomorrow'
			desc: 'the day after tomorrow'
			schema:
				root:
					type: 'date'
					id: 'test'
				run: ''
			result:
				test: moment({hour: 0}).add(2, 'd').toDate()
			matches: 1
		,
			input: 'in 3 days'
			desc: 'in n days'
			schema:
				root:
					type: 'date'
					id: 'test'
				run: ''
			result:
				test: moment({hour: 0}).add(3, 'd').toDate()
			matches: 1
		]

		async.each testCases, (testCase, done) ->
			dataCalled = chai.spy()
			new Parser()
			.understand testCase.schema
			.on 'data', (data) ->
				dataCalled()
				expect(data, testCase.desc).to.exist
				expect(data.result, testCase.desc).to.exist
				expect(data.result.test, testCase.desc).to.equalDate testCase.result.test
			.on 'end', ->
				expect(dataCalled, testCase.desc).to.have.been.called.exactly(testCase.matches)
				done()
			.parse(testCase.input)
		, done


	it 'can run an inputOption', (done) ->
		testCase =
			input: 'test'
			schema:
				root: 'test'
				run: 'run'
			scope:
				run: chai.spy (result, done) ->
					done()

		dataCalled = chai.spy()

		inputOption = null
		new Parser()
		.understand {schema: testCase.schema, scope: testCase.scope}
		.on 'data', (data) ->
			inputOption = data
			dataCalled()
		.on 'end', ->
			expect(dataCalled, testCase.desc).to.have.been.called.once
			@run inputOption, (err) ->
				expect(err).to.not.exist
				expect(testCase.scope.run).to.have.been.called.once
				done()
		.parse(testCase.input)
