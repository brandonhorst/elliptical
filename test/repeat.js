var chai = require('chai');
var expect = chai.expect;
var testUtil = require('./util');

describe('repeat', function() {
  var parser;

  beforeEach(function() {
    parser = new testUtil.lacona.Parser({sentences: ['test']});
  });

  it('does not accept input that does not match the child', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'repeat',
          child: 'super',
          separator: 'man'
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(2);
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['wrong'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('accepts the child on its own', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'repeat',
          child: 'super',
          separator: 'man'
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('man');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['superm'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('accepts the child twice, with the separator in the middle', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'repeat',
          child: 'super',
          separator: 'man'
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('super');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['supermans'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('creates an array from the values of the children', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
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
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.result.testId).to.deep.equal(['testValue', 'testValue']);
      expect(data[1].data.result.subElementId).to.be.undefined;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['supermans'])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });

  it('can set a value to the result', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          id: 'testId',
          value: 'testValue',
          children: [
            'super',
            'man'
          ]
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.result.testId).to.equal('testValue');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['superm'])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });


  it('does not accept fewer than min iterations', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'repeat',
          child: 'a',
          separator: 'b',
          min: 2
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.match[0].string).to.equal('a');
      expect(data[1].data.suggestion.words[0].string).to.equal('b');
      expect(data[1].data.completion[0].string).to.equal('a');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['a'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });


  it('does not accept more than max iterations', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'repeat',
          child: 'a',
          separator: 'b',
          max: 1
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words).to.be.empty;
      expect(data[1].data.match[0].string).to.equal('a');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['a'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });


  it('rejects non-unique repeated elements', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
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
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(2);
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['a a'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });


  it('accepts unique repeated elements', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
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
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.match[0].string).to.equal('a');
      expect(data[1].data.match[2].string).to.equal('b');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['a b'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });
});
