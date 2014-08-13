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

describe('repeat', function() {
	var parser;

	beforeEach(function() {
		parser = new lacona.Parser();
	});

	it('does not accept input that does not match the child', function (done) {
		var schema = {
			root: {
				type: 'repeat',
				child: 'super',
				separator: 'man'
			},
			run: ''
		}

		var onData = sinon.spy();

		var onEnd = function() {
			expect(onData).to.not.have.been.called;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('wrong');
	});

	it('accepts the child on its own', function (done) {
		var schema = {
			root: {
				type: 'repeat',
				child: 'super',
				separator: 'man'
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.equal('man');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('superm');
	});

	it('accepts the child twice, with the separator in the middle', function (done) {
		var schema = {
			root: {
				type: 'repeat',
				child: 'super',
				separator: 'man'
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.equal('super');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('supermans');
	});

	it('creates an array from the values of the children', function (done) {
		var schema = {
			root: {
				type: 'repeat',
				child: {
					type: 'literal',
					display: 'super',
					value: 'testValue',
					id: 'subElementId'
				},
				separator: 'man',
				id: 'testId'
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.result.testId).to.deep.equal(['testValue', 'testValue']);
			expect(data.result.subElementId).to.be.undefined;
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('supermans');
	});

	it('can set a value to the result', function (done) {
		var schema = {
			root: {
				type: 'sequence',
				id: 'testId',
				value: 'testValue',
				children: [
					'super',
					'man'
				]
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.result.testId).to.equal('testValue');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('super m');
	});


	it('does not accept fewer than min iterations', function (done) {
		var schema = {
			root: {
				type: 'repeat',
				child: 'a',
				separator: 'b',
				min: 2
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.match[0].string).to.equal('a');
			expect(data.suggestion.words[0].string).to.equal('b');
			expect(data.completion[0].string).to.equal('a');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('a');
	});


	it('does not accept more than max iterations', function (done) {
		var schema = {
			root: {
				type: 'repeat',
				child: 'a',
				separator: 'b',
				max: 1
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words).to.be.empty;
			expect(data.match[0].string).to.equal('a');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('a');
	});


	it('rejects non-unique repeated elements', function (done) {
		var schema = {
			root: {
				type: 'repeat',
				child: {
					type: 'choice',
					children: [
						'a',
						'b'
					]
				},
				id: 'rep',
				unique: true
			},
			run: ''
		}

		var onData = sinon.spy();

		var onEnd = function() {
			expect(onData).to.not.have.been.called;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('a a');
	});


	it('accepts unique repeated elements', function (done) {
		var schema = {
			root: {
				type: 'repeat',
				child: {
					type: 'choice',
					children: [
						'a',
						'b'
					]
				},
				unique: true
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.match[0].string).to.equal('a');
			expect(data.match[2].string).to.equal('b');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('a b');
	});
});
