var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('limit', function() {
  var parser;

  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  describe('value', function () {
    it('limits calls to data', function (done) {
      var test = u.lacona.createPhrase({
        name: 'test/test',
        compute: function (input, data, done) {
          data({text: 'testa'});
          data({text: 'testb'});
          data({text: 'testc'});
          done();
        },
        describe: function () {
          return u.lacona.value({limit: 2, compute: this.compute});
        }
      });

      function callback(data) {
        expect(data).to.have.length(4);
        expect(u.ft.all(data[1].data)).to.equal('testa');
        expect(u.ft.all(data[2].data)).to.equal('testb');
        done();
      }

      parser.sentences = [test()];
      u.toStream(['test'])
        .pipe(parser)
        .pipe(u.toArray(callback));
    });
  });

  describe('choice', function () {
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
        expect(u.ft.suggestion(data[1].data)).to.equal('right');
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
            ]
          });
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
            ]
          });
        }
      });

      function callback(data) {
        expect(data).to.have.length(4);
        expect(u.ft.suggestion(data[1].data)).to.contain('right');
        expect(u.ft.suggestion(data[2].data)).to.contain('right');
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
        expect(u.ft.suggestion(data[1].data)).to.equal('right');
        expect(u.ft.suggestion(data[2].data)).to.equal('right also');
        expect(u.ft.suggestion(data[3].data)).to.equal('right third');
        done();
      }

      parser.sentences = [test()];
      u.toStream(['r'])
        .pipe(parser)
        .pipe(u.toArray(callback));
    });
  });
});
