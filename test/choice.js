var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var chai = require('chai');
var expect = chai.expect;
var lacona;
var sinon = require('sinon');

chai.use(require('sinon-chai'));

if (typeof window !== 'undefined' && window.lacona) {
	lacona = window.lacona;
} else {
	lacona = require('../src/lacona');
}

chai.config.includeStack = true;

describe('choice', function() {
	var parser;

	beforeEach(function() {
		parser = new lacona.Parser();
	});

	it('suggests one valid choice', function (done) {
		var schema = {
			root: {
				type: 'choice',
				children: [
					'right',
					'wrong'
				]
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.equal('right');
			expect(data.result).to.be.empty;
		});

		var onEnd = function() {
			expect(onData).to.have.been.called.once;
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
			root: {
				type: 'choice',
				children: [
					'right',
					'right also'
				]
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.contain('right');
			expect(data.result).to.be.empty;
		});

		var onEnd = function() {
			expect(onData).to.have.been.called.twice;
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
			root: {
				type: 'choice',
				children: [
					'right',
					'right also'
				]
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.contain('right');
			expect(data.result).to.be.empty;
		});

		var onEnd = function() {
			expect(onData).to.have.been.called.twice;
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
			root: {
				type: 'choice',
				children: [
					'wrong',
					'wrong also'
				]
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
		.parse('r');
	});

	it('adopts the value of the child', function (done) {
		var schema = {
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
			},
			run: ''
		}

		var onData = sinon.spy(function(data) {
			expect(data.suggestion.words[0].string).to.equal('right');
			expect(data.result.testId).to.equal('testValue');
			expect(data.result.subId).to.equal('testValue');
		});

		var onEnd = function() {
			expect(onData).to.have.been.called.once;
			done();
		};

		parser
		.understand(schema)
		.on('data', onData)
		.on('end', onEnd)
		.parse('r');
	});
});
