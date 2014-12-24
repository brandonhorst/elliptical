var chai = require('chai');
var expect = chai.expect;
var testUtil = require('./util.js');

describe('choice', function() {
  var parser;

  beforeEach(function() {
    parser = new testUtil.lacona.Parser({sentences: ['test']});
  });

  it('suggests one valid choice', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'choice',
          children: [
            'right',
            'wrong'
          ]
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].suggestion.words[0].string).to.equal('right');
      expect(data[0].result).to.be.empty;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['r'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('suggests multiple valid choices', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'choice',
          children: [
            'right',
            'right also'
          ]
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(2);
      expect(data[0].suggestion.words[0].string).to.contain('right');
      expect(data[0].result).to.be.empty;
      expect(data[1].suggestion.words[0].string).to.contain('right');
      expect(data[1].result).to.be.empty;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['r'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('suggests no valid choices', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'choice',
          children: [
            'wrong',
            'wrong also'
          ]
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(0);
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['r'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('adopts the value of the child', function (done) {
    var grammar = {
      phrases: [{
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
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].suggestion.words[0].string).to.equal('right');
      expect(data[0].result.testId).to.equal('testValue');
      expect(data[0].result.subId).to.equal('testValue');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['r'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('can be restricted by a limit of 1', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'choice',
          children: [
            'right',
            'really wrong'
          ],
          limit: 1
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].suggestion.words[0].string).to.equal('right');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['r'])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });

  it('has a value when limited', function (done) {
    var grammar = {
      phrases: [{
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
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].result.testId).to.equal('testValue');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['r'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('can be restricted by a limit of more than 1', function (done) {
    var grammar = {
      phrases: [{
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
      }]
    };

    function callback(data) {
      expect(data).to.have.length(2);
      expect(data[0].suggestion.words[0].string).to.contain('right');
      expect(data[1].suggestion.words[0].string).to.contain('right');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['r'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('still works when a limited child has multiple options', function (done) {
    var grammar = {
      phrases: [{
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
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[0].suggestion.words[0].string).to.contain('right');
      expect(data[1].suggestion.words[0].string).to.contain('right');
      expect(data[2].suggestion.words[0].string).to.contain('right');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['r'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });
});
