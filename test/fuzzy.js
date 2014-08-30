var _ = require('lodash');
var async = require('async');
var chai = require('chai');
var expect = chai.expect;
var lacona;
var sinon = require('sinon');

chai.use(require('sinon-chai'));

if (typeof window !== 'undefined' && window.lacona) {
	lacona = window.lacona;
} else {
	lacona = require('../lib/lacona');
}


describe('Parser with fuzzy matching', function () {
	var parser;
	beforeEach(function() {
		parser = new lacona.Parser({fuzzy: true, sentences: ['test']});
	});

	it('supports fuzzy matching', function (done) {
		var schema = {
			name: 'test',
			root: 'a simple test'
		}

		var onData = sinon.spy(function (data) {
			expect(data.suggestion.charactersComplete).to.equal(10);
			expect(data.suggestion.words[0].string).to.equal('a simple test');
		});

		var onEnd = function () {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('asmlt');
	});
});