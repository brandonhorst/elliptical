var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var u = require('./util');

chai.use(require('sinon-chai'));

describe('value', function () {
  var parser;
  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('suggests a value', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      fun: function (input, data, done) {
        data({display: 'disp', value: 'val'});
        done();
      },
      describe: function () {
        return u.lacona.value({
          compute: this.fun,
          id: 'test'
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.result.test).to.equal('val');
      expect(data[1].data.suggestion.words[0].string).to.equal('disp');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['di'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('can access props its function', function (done) {
    var spy = sinon.spy();
    var test = u.lacona.createPhrase({
      name: 'test/test',
      fun: function (input, data, done) {
        expect(this.props.myVar).to.equal('myVal');
        spy();
        done();
      },
      describe: function () {
        return u.lacona.value({compute: this.fun});
      }
    });

    function callback() {
      expect(spy).to.have.been.calledOnce;

      done();
    }

    parser.sentences = [test({myVar: 'myVal'})];
    u.toStream(['di'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('can call functions in props', function (done) {
    var spy = sinon.spy();
    var test = u.lacona.createPhrase({
      name: 'test/test',
      someFun: function () {
        spy();
      },
      describe: function () {
        return dep({propFunction: this.someFun});
      }
    });

    var dep = u.lacona.createPhrase({
      name: 'test/dep',
      fun: function (input, data, done) {
        this.props.propFunction();
        done();
      },
      describe: function () {
        return u.lacona.value({compute: this.fun});
      }
    });

    function callback() {
      expect(spy).to.have.been.calledOnce;
      done();
    }

    parser.sentences = [test()];
    u.toStream(['di'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

});
