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
          u.lacona.literal({text: 'super'}),
          u.lacona.literal({text: 'man'})
        ]});
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(u.ft.suggestion(data[1].data)).to.equal('man');
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
            u.lacona.literal({text: 'super'}),
            u.lacona.literal({text: 'man'})
          ],
          separator: u.lacona.literal({text: ' '})
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(u.ft.suggestion(data[1].data)).to.equal('man');
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
          children: [
            u.lacona.literal({text: 'super'}),
            u.lacona.literal({
              text: 'maximum',
              value: 'optionalValue',
              id: 'optionalId',
              optional: true
            }),
            u.lacona.literal({text: 'man'})
          ]
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(4);
      expect(u.ft.suggestion(data[1].data)).to.equal('man');
      expect(data[1].data.result).to.be.empty;
      expect(data[2].data.result.optionalId).to.equal('optionalValue');
      expect(u.ft.suggestion(data[2].data)).to.equal('maximum');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['superm'])
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
            u.lacona.literal({text: 'super'}),
            u.lacona.literal({text: 'man'})
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

  it('passes on its category', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({
          category: 'myCat',
          children: [
            u.lacona.literal({text: 'super'}),
            u.lacona.literal({text: 'man'})
          ]
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.match[0].category).to.equal('myCat');
      expect(data[1].data.suggestion[0].category).to.equal('myCat');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['superm'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });
});
