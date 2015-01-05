var chai = require('chai');
var expect = chai.expect;
var testUtil = require('./util');

describe('Phrase', function () {
  var parser;
  beforeEach(function() {
    parser = new testUtil.lacona.Parser({sentences: ['test']});
  });

  it('handles phrases with extension', function (done) {
    var grammar = {
      phrases: [{
        name: 'extended',
        root: 'test'
      }, {
        name: 'extender',
        inherits: ['extended'],
        root: 'totally'
      }, {
        name: 'test',
        root: {type: 'extended'}
      }]
    };

    function callback(data) {
      expect(data).to.have.length(4);
      expect(['test', 'totally']).to.contain(data[1].data.suggestion.words[0].string);
      expect(['test', 'totally']).to.contain(data[2].data.suggestion.words[0].string);
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['t'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('handles phrases with extension and a specified version', function (done) {
    var grammar = {
      phrases: [{
        name: 'extended',
        version: '1.2.3',
        root: 'test'
      }, {
        name: 'extender',
        inherits: {extended: '^1.0.0'},
        root: 'totally'
      }, {
        name: 'test',
        root: {type: 'extended'}
      }]
    };

    function callback(data) {
      expect(data).to.have.length(4);
      expect(['test', 'totally']).to.contain(data[1].data.suggestion.words[0].string);
      expect(['test', 'totally']).to.contain(data[2].data.suggestion.words[0].string);
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['t'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('rejects phrases with an incorrect version specified version', function (done) {
    var grammar = {
      phrases: [{
        name: 'extended',
        version: '2.3.4',
        root: 'test'
      }, {
        name: 'extender',
        inherits: {extended: '^1.0.0'},
        root: 'totally'
      }, {
        name: 'test',
        root: {type: 'extended'}
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('test');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['t'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('allows for recursive phrases (no infinite loop)', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: [
          'the ', {
            type: 'choice',
            children: [
              'test',
              {type: 'test'}
            ]
          }
        ]
      }]
    };

    function callback(data) {
      expect(data).to.have.length(4);
      expect(['the ', 'test']).to.contain(data[1].data.suggestion.words[0].string);
      expect(['the ', 'test']).to.contain(data[2].data.suggestion.words[0].string);
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['the t'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });



  it('allows for nested phrases with the same id', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: { type: 'include1', id: 'test' }
      }, {
        name: 'include1',
        root: { type: 'include2', id: '@value' }
      }, {
        name: 'include2',
        root: { type: 'literal', value: 'test', display: 'test', id: '@value' }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('test');
      expect(data[1].data.result.test).to.equal('test');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['tes'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('simply ignores phrases that do not exist', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {type: 'nonexistant'}
      }]
    };

    function callback(data) {
      expect(data).to.have.length(2);
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['t'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('throws for phrases without a default-lang schema', function () {
    var grammar = {
      phrases: [{
        name: 'test',
        schemas: [{
          langs: ['en-US'],
          root: 'whatever'
        }]
      }]
    };

    expect(function() {
      parser.understand(grammar);
    }).to.throw(testUtil.lacona.Error);
  });

  it('throws for phrases without a lang', function () {
    var grammar = {
      phrases: [{
        name: 'test',
        schemas: [{
          root: 'whatever'
        }]
      }]
    };

    expect(function() {
      parser.understand(grammar);
    }).to.throw(testUtil.lacona.Error);
  });

  it('throws for phrases without a root', function () {
    var grammar = {
      phrases: [{
        name: 'test'
      }]
    };

    expect(function() {
      parser.understand(grammar);
    }).to.throw(testUtil.lacona.Error);
  });
});
