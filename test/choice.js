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
      expect(u.ft.suggestion(data[1].data)).to.equal('right');
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
      expect(u.ft.suggestion(data[1].data)).to.contain('right');
      expect(data[1].data.result).to.be.empty;
      expect(u.ft.suggestion(data[2].data)).to.contain('right');
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
      expect(u.ft.suggestion(data[1].data)).to.equal('right');
      expect(data[1].data.result.testId).to.equal('testValue');
      expect(data[1].data.result.subId).to.equal('testValue');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['r'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });


  it('passes on its category', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.choice({
          category: 'myCat',
          children: [
            u.lacona.literal({text: 'aaa'}),
            u.lacona.literal({text: 'aab'})
          ]
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(4);
      expect(data[1].data.suggestion[0].category).to.equal('myCat');
      expect(data[2].data.suggestion[0].category).to.equal('myCat');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['aa'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });
});
