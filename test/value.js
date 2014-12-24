var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var testUtil = require('./util');

chai.use(require('sinon-chai'));

describe('Parser', function () {
  var parser;
  beforeEach(function() {
    parser = new testUtil.lacona.Parser({sentences: ['test']});
  });

  it('suggests a value', function () {
    var grammar = {
      scope: {
        fun: function (input, data, done) {
          data({display: 'disp', value: 'val'});
          done();
        }
      },
      phrases: [{
        name: 'test',
        root: {type: 'value', compute: 'fun', id: 'test'}
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].result.test).to.equal('val');
      expect(data[0].suggestion.words[0].string).to.equal('disp');
    }

    parser.understand(grammar);
    testUtil.toStream(['di'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('can access variables in parent in its function', function () {
    function fun(input, data, done) {
      expect(this.myVar).to.equal('myVal');
      data({display: 'disp', value: 'val'});
      done();
    }

    var grammar = {
      phrases: [{
        name: 'test',
        root: {type: 'depPhrase', myVar: 'myVal'}
      }],
      dependencies: [{
        scope: {depFun: fun},
        phrases: [{
          name: 'depPhrase',
          root: {type: 'value', compute: 'depFun'}
        }]
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
    }

    parser.understand(grammar);
    testUtil.toStream(['di'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('can $call functions defined', function (done) {

    var fun = sinon.spy(function (done) {
      done();
    });

    var depFun = sinon.spy(function depFun(input, data, done) {
      this.$call('fun', function (err) {
        expect(err).to.not.exist;
      });
      done();
    });

    var grammar = {
      scope: {fun: fun},
      phrases: [{
        name: 'test',
        root: {type: 'depPhrase'}
      }],
      dependencies: [{
        scope: {depFun: depFun},
        phrases: [{
          name: 'depPhrase',
          root: {type: 'value', compute: 'depFun'}
        }]
      }]
    };

    function callback(data) {
      expect(data).to.have.length(0);
      expect(fun).to.have.been.calledOnce;
      expect(depFun).to.have.been.calledOnce;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['di'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('can $call functions defined with variables', function (done) {
    var fun = sinon.spy(function fun(done) {
      expect(this.myVar).to.equal('myVal');
      done();
    });

    var depFun = sinon.spy(function depFun(input, data, done) {
      this.$call('fun', function (err) {
        expect(err).to.not.exist;
      });
      done();
    });

    var grammar = {
      scope: {fun: fun},
      phrases: [{
        name: 'test',
        root: {type: 'depPhrase', myVar: 'myVal'}
      }],
      dependencies: [{
        scope: {depFun: depFun},
        phrases: [{
          name: 'depPhrase',
          root: {type: 'value', compute: 'depFun'}
        }]
      }]
    };

    function callback(data) {
      expect(data).to.have.length(0);
      expect(fun).to.have.been.calledOnce;
      expect(depFun).to.have.been.calledOnce;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['di'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('can $call functions defined (2 levels deep)', function (done) {
    var fun = sinon.spy(function fun(done) {
      expect(this.myVar).to.equal('val');
      done();
    });

    var depFun = sinon.spy(function depFun(done) {
      expect(this.myVar).to.equal('val');
      this.$call('fun', function (err) {
        expect(err).to.not.exist;
        done();
      });
    });

    var depDepFun = sinon.spy(function depDepFun(input, data, done) {
      expect(this.myVar).to.equal('depVal');
      this.$call('depFun', function (err) {
        expect(err).to.not.exist;
        done();
      });
    });
    var grammar = {
      scope: {fun: fun},
      phrases: [{
        name: 'test',
        root: {type: 'depPhrase', myVar: 'val'}
      }],
      dependencies: [{
        scope: {
          depFun: depFun
        },
        phrases: [{
          name: 'depPhrase',
          root: {type: 'depDepPhrase', myVar: 'depVal'}
        }],
        dependencies: [{
          scope: {
            depDepFun: depDepFun
          },
          phrases: [{
            name: 'depDepPhrase',
            root: {type: 'value', compute: 'depDepFun'}
          }],
        }]
      }]
    };

    function callback(data) {
      expect(data).to.have.length(0);
      expect(fun).to.have.been.calledOnce;
      expect(depFun).to.have.been.calledOnce;
      expect(depDepFun).to.have.been.calledOnce;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['di'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('has no variables when called in a sentence', function () {
    var fun = sinon.spy(function fun(input, data, done) {
      expect(this.myVar).to.not.exist;
      done();
    });

    var grammar = {
      scope: {fun: fun},
      phrases: [{
        name: 'test',
        myVar: 'myVal', //this is never used
        root: {type: 'value', compute: 'fun'}
      }]
    };

    function callback(data) {
      expect(data).to.have.length(0);
      expect(fun).to.have.been.calledOnce;
    }

    parser.understand(grammar);
    testUtil.toStream(['di'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

});
