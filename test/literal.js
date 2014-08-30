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

chai.config.includeStack = true;

describe('literal', function() {
	var parser;

	beforeEach(function() {
		parser = new lacona.Parser({sentences: ['test']});
	});

	it('handles an implicit literal (string in schema)', function (done) {
		var schema = {
			name: 'test',
			root: 'literal test'
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words).to.have.length(1);
			expect(data.suggestion.charactersComplete).to.equal(1);
			expect(data.suggestion.words[0].string).to.equal('literal test');
			expect(data.result).to.be.empty;
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('l');
	});

	it('handles a fully-qualified literal (no id)', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'literal',
				display: 'literal test'
			}
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words).to.have.length(1);
			expect(data.suggestion.charactersComplete).to.equal(1);
			expect(data.suggestion.words[0].string).to.equal('literal test');
			expect(data.result).to.be.empty;
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('l');
	});

	it('handles a fully-qualified literal with an id', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'literal',
				display: 'literal test',
				value: 'test',
				id: 'testId'
			}
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words).to.have.length(1);
			expect(data.suggestion.charactersComplete).to.equal(1);
			expect(data.suggestion.words[0].string).to.equal('literal test');
			expect(data.result).to.deep.equal({
				testId: 'test'
			});
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('l');

	});
});