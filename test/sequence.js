var chai = require('chai');
var expect = chai.expect;
var testUtil = require('./util');

describe('sequence', function() {
  var parser;

  beforeEach(function() {
    parser = new testUtil.lacona.Parser({sentences: ['test']});
  });

  it('puts two elements in order', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
            'super',
            'man'
          ]
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].suggestion.words[0].string).to.equal('man');
      expect(data[0].result).to.be.empty;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['superm'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  // it('space is punctuation - tacked onto suggestion', function (done) {
  //   var grammar = {
  //     phrases: [{
  //       name: 'test',
  //       root: {
  //         type: 'sequence',
  //         children: [
  //         'super',
  //         'man'
  //         ]
  //       }
  //     }]
  //   };
  //
  //   var onData = sinon.spy(function(data) {
  //     expect(data.suggestion.words).to.have.length(2);
  //     expect(data.suggestion.words[0].string).to.equal('super');
  //     expect(data.suggestion.words[1].string).to.equal(' ');
  //     expect(data.result).to.be.empty;
  //   });
  //
  //   var onEnd = function() {
  //     expect(onData).to.have.been.calledOnce;
  //     done();
  //   };
  //
  //   parser
  //   .understand(grammar)
  //   .on('data', onData)
  //   .on('end', onEnd)
  //   .parse('sup');
  // });

  it('handles an empty separator', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
          'super',
          'man'
          ],
          separator: ''
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].suggestion.words[0].string).to.equal('man');
      expect(data[0].result).to.be.empty;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['superm'])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });

  it('handles a null separator', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
          'super',
          'man'
          ],
          separator: null
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].suggestion.words[0].string).to.equal('man');
      expect(data[0].result).to.be.empty;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['superm'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });


  it('rejects input with a separator at the end', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
            'super',
            'man'
          ]
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(0);
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['super man '])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('custom separator', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
            'super',
            'man'
          ],
          separator: ' test '
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].suggestion.words[0].string).to.equal('man');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['super test m'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('optional child', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          separator: ' ',
          children: [
            'super', {
              type: 'literal',
              optional: 'true',
              display: 'maximum',
              value: 'optionalValue',
              id: 'optionalId',
            },
            'man'
          ]
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(2);
      expect(['maximum', 'man']).to.contain(data[0].suggestion.words[0].string);
      expect(['maximum', 'man']).to.contain(data[1].suggestion.words[0].string);
      if (data[0].suggestion.words[0].string === 'maximum') {
        expect(data[0].result.optionalId).to.equal('optionalValue');
        expect(data[1].result).to.be.empty;
      } else {
        expect(data[1].result.optionalId).to.equal('optionalValue');
        expect(data[0].result).to.be.empty;
      }
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['super m'])
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
      expect(data).to.have.length(1);
      expect(data[0].result.testId).to.equal('testValue');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['superm'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });
});
