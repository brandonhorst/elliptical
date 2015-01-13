var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('sequence', function() {
  var parser;

  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('puts two elements in order', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({children: [
          u.lacona.literal({display: 'super'}),
          u.lacona.literal({display: 'man'})
        ]});
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('man');
      expect(data[1].data.result).to.be.empty;
      done();
    }

    parser.sentences = [test()];
    u.toStream(['superm'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('handles a separator', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({
          children: [
            u.lacona.literal({display: 'super'}),
            u.lacona.literal({display: 'man'})
          ],
          separator: u.lacona.literal({display: ' '})
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('man');
      expect(data[1].data.result).to.be.empty;
      done();
    }

    parser.sentences = [test()];
    u.toStream(['super m'])
    .pipe(parser)
    .pipe(u.toArray(callback));
  });

  it('handles an optional child with a separator', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({
          separator: u.lacona.literal({display: ' '}),
          children: [
            u.lacona.literal({display: 'super'}),
            u.lacona.literal({
              display: 'maximum',
              value: 'optionalValue',
              id: 'optionalId',
              optional: true
            }),
            u.lacona.literal({display: 'man'})
          ]
        });
      }
    });

    function callback(data) {
      var dataWithOptional, dataWithoutOptional;

      expect(data).to.have.length(4);
      expect(['maximum', 'man']).to.contain(data[1].data.suggestion.words[0].string);
      expect(['maximum', 'man']).to.contain(data[2].data.suggestion.words[0].string);

      if (data[1].data.suggestion.words[0].string === 'maximum') {
        dataWithOptional = data[1];
        dataWithoutOptional = data[2];
      } else {
        dataWithoutOptional = data[1];
        dataWithOptional = data[2];
      }

      expect(dataWithOptional.data.result.optionalId).to.equal('optionalValue');
      expect(dataWithoutOptional.data.result).to.be.empty;
      done();
    }

    parser.sentences = [test()];
    u.toStream(['super m'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('can set a value to the result', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({
          id: 'testId',
          value: 'testValue',
          children: [
            u.lacona.literal({display: 'super'}),
            u.lacona.literal({display: 'man'})
          ]
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.result.testId).to.equal('testValue');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['superm'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });
});
