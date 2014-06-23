_ = require 'lodash'
async = require 'async'
chai = require 'chai'
chai.use require 'chai-spies'

if window?.lacona?
	lacona = window.lacona
else
	lacona = require '../src/lacona'

{Parser} = lacona

chai.config.includeStack = true
expect = chai.expect

describe 'run', ->
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
		.on 'data', (inputOption) ->
			lacona.run inputOption, (err) ->
				expect(err).to.not.exist
				expect(testCase.scope.run).to.have.been.called.once
				done()
		.parse(testCase.input)
