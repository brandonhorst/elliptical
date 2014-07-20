_ = require 'lodash'
async = require 'async'
chai = require 'chai'

if window?.lacona?
	lacona = window.lacona
else
	lacona = require '../src/lacona'

chai.config.includeStack = true
expect = chai.expect

describe 'nextText', ->
	it 'can get the text from an inputOption', (done) ->
		inputOption =
			match: [
				{string: 'test', partOfSpeech: 'action'}
				{string: '1', partOfSpeech: 'action'}
			]
			suggestion:
				charactersComplete: 0
				words: [
					{string: 'test', partOfSpeech: 'action'}
					{string: '1', partOfSpeech: 'action'}
				]
			completion: {}

		lacona.nextText inputOption, (err, nextText) ->
			expect(err).to.not.exist
			expect(nextText).to.equal 'test1test1'
			done()

