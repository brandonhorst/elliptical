var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('choice', function() {
  var parser;

  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('suggests one valid choice', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.choice({children: [
          u.lacona.literal({text: 'right'}),
          u.lacona.literal({text: 'wrong'})
        ]});
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('right');
      expect(data[1].data.result).to.be.empty;
      done();
    }

    parser.sentences = [test()];
    u.toStream(['r'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('suggests multiple valid choices', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.choice({children: [
          u.lacona.literal({text: 'right'}),
          u.lacona.literal({text: 'right also'})
        ]});
      }
    });

    function callback(data) {
      expect(data).to.have.length(4);
      expect(data[1].data.suggestion.words[0].string).to.contain('right');
      expect(data[1].data.result).to.be.empty;
      expect(data[2].data.suggestion.words[0].string).to.contain('right');
      expect(data[2].data.result).to.be.empty;
      done();
    }

    parser.sentences = [test()];
    u.toStream(['r'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('suggests no valid choices', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.choice({children: [
          u.lacona.literal({text: 'wrong'}),
          u.lacona.literal({text: 'wrong also'})
        ]});
      }
    });

    function callback(data) {
      expect(data).to.have.length(2);
      done();
    }

    parser.sentences = [test()];
    u.toStream(['r'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('adopts the value of the child', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.choice({
          id: 'testId',
          children: [
            u.lacona.literal({
              id: 'subId',
              text: 'right',
              value: 'testValue'
            }),
            u.lacona.literal({text: 'wrong'})
          ]
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('right');
      expect(data[1].data.result.testId).to.equal('testValue');
      expect(data[1].data.result.subId).to.equal('testValue');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['r'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('can be restricted by a limit of 1', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.choice({
          limit: 1,
          children: [
            u.lacona.literal({text: 'right'}),
            u.lacona.literal({text: 'right also'})
          ]
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('right');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['r'])
    .pipe(parser)
    .pipe(u.toArray(callback));
  });

  it('has a value when limited', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.choice({
          id: 'testId',
          limit: 1,
          children: [
            u.lacona.literal({
              id: 'subId',
              text: 'right',
              value: 'testValue'
            }),
            u.lacona.literal({text: 'right also'})
          ]});
        }
      });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.result.testId).to.equal('testValue');
      expect(data[1].data.result.subId).to.equal('testValue');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['r'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('can be restricted by a limit of more than 1', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.choice({
          limit: 2,
          children: [
            u.lacona.literal({text: 'right'}),
            u.lacona.literal({text: 'right also'}),
            u.lacona.literal({text: 'right but excluded'})
          ]});
        }
      });

    function callback(data) {
      expect(data).to.have.length(4);
      expect(data[1].data.suggestion.words[0].string).to.contain('right');
      expect(data[2].data.suggestion.words[0].string).to.contain('right');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['r'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('still works when a limited child has multiple options', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.choice({
          limit: 2,
          children: [
            u.lacona.choice({children: [
              u.lacona.literal({text: 'right'}),
              u.lacona.literal({text: 'right also'})
            ]}),
            u.lacona.literal({text: 'wrong'}),
            u.lacona.literal({text: 'right third'})
          ]
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(5);
      expect(data[1].data.suggestion.words[0].string).to.equal('right');
      expect(data[2].data.suggestion.words[0].string).to.equal('right also');
      expect(data[3].data.suggestion.words[0].string).to.equal('right third');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['r'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });
});
