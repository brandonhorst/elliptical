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

describe('run', function () {
	var parser;

	beforeEach(function() {
		parser = new lacona.Parser();
	});

	it('can run an inputOption', function (done) {
		var grammar = {
			scope: {
				run: sinon.spy(function (result, done) {
					done();
				})
			},
			schema: {
				root: 'test',
				run: 'run'
			}
		}

		var afterRun = function (err) {
			expect(err).to.not.exist;
			expect(grammar.scope.run).to.have.been.calledOnce;
			done();
		}

		var onData = sinon.spy(function (data) {
			lacona.run(data, afterRun);
		});

		parser
		.understand(grammar)
		.on('data', onData)
		.parse('test');
	});
});