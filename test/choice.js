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

describe('choice', function() {
	var parser;

	beforeEach(function() {
		parser = new lacona.Parser({sentences: ['test']});
	});

	it('suggests one valid choice', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'choice',
				children: [
					'right',
					'wrong'
				]
			}
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.equal('right');
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
		.parse('r');
	});

	it('suggests multiple valid choices', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'choice',
				children: [
					'right',
					'right also'
				]
			}
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.contain('right');
			expect(data.result).to.be.empty;
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledTwice;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('r');
	});

	it('suggests multiple valid choices', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'choice',
				children: [
					'right',
					'right also'
				]
			}
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.contain('right');
			expect(data.result).to.be.empty;
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledTwice;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('r');
	});

	it('suggests no valid choices', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'choice',
				children: [
					'wrong',
					'wrong also'
				]
			}
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
		.parse('r');
	});

	it('adopts the value of the child', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'choice',
				id: 'testId',
				children: [{
					type: 'literal',
					display: 'right',
					value: 'testValue',
					id: 'subId'
				},
					'wrong'
				]
			}
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.equal('right');
			expect(data.result.testId).to.equal('testValue');
			expect(data.result.subId).to.equal('testValue');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('r');
	});

	it('can be restricted by a limit of 1', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'choice',
				children: [
					'right',
					'really wrong'
				],
				limit: 1
			}
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.equal('right');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledOnce;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('r');
	});

	it('can be restricted by a limit of more than 1', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'choice',
				children: [{
						type: 'literal',
						value: 'testValue',
						display: 'right'
					},
					'really wrong'
				],
				limit: 1,
				id: 'testId'
			}
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
		.parse('r');
	});

	it('has a value when limited', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'choice',
				children: [
					'right',
					'right too',
					'really wrong'
				],
				limit: 2
			}
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.contain('right');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledTwice;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('r');
	});

	it('still works when a limited child has multiple options', function (done) {
		var schema = {
			name: 'test',
			root: {
				type: 'choice',
				children: [
					{
						type: 'choice',
						children: [
							'right',
							'right too'
						]
					},
					'wrong',
					'right as well'
				],
				limit: 2
			}
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.contain('right');
		});

		var onEnd = function() {
			expect(onData).to.have.been.calledThrice;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('r');
	});
});
