var chai = require('chai');
var es = require('event-stream');
var expect = chai.expect;
var fulltext = require('lacona-util-fulltext');
var lacona = require('..');

describe('repeat', function() {
  var parser;

  beforeEach(function() {
    parser = new lacona.Parser();
  });

  describe('basic usage', function () {
    var test;

    beforeEach(function () {
      test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return lacona.repeat({
            child: lacona.literal({text: 'super'}),
            separator: lacona.literal({text: 'man'})
          });
        }
      });
    });

    it('does not accept input that does not match the child', function (done) {
      function callback(err, data) {
        expect(data).to.have.length(2);
        done();
      }

      parser.sentences = [test()];
      es.readArray(['wrong'])
        .pipe(parser)
        .pipe(es.writeArray(callback));
    });

    it('accepts the child on its own', function (done) {
      function callback(err, data) {
        expect(data).to.have.length(3);
        expect(fulltext.suggestion(data[1].data)).to.equal('man');
        done();
      }

      parser.sentences = [test()];
      es.readArray(['superm'])
        .pipe(parser)
        .pipe(es.writeArray(callback));
    });

    it('accepts the child twice, with the separator in the middle', function (done) {
      function callback(err, data) {
        expect(data).to.have.length(3);
        expect(fulltext.suggestion(data[1].data)).to.equal('super');
        done();
      }

      parser.sentences = [test()];
      es.readArray(['supermans'])
        .pipe(parser)
        .pipe(es.writeArray(callback));
    });
  });

  describe('basic usage (no separator)', function () {
    var test;

    beforeEach(function () {
      test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return lacona.repeat({
            child: lacona.literal({text: 'super'})
          });
        }
      });
    });

    it('does not accept input that does not match the child', function (done) {
      function callback(err, data) {
        expect(data).to.have.length(2);
        done();
      }

      parser.sentences = [test()];
      es.readArray(['wrong'])
        .pipe(parser)
        .pipe(es.writeArray(callback));
    });

    it('accepts the child on its own', function (done) {
      function callback(err, data) {
        expect(data).to.have.length(3);
        expect(fulltext.suggestion(data[1].data)).to.equal('super');
        done();
      }

      parser.sentences = [test()];
      es.readArray(['sup'])
        .pipe(parser)
        .pipe(es.writeArray(callback));
    });

    it('accepts the child twice', function (done) {
      function callback(err, data) {
        expect(data).to.have.length(3);
        expect(fulltext.suggestion(data[1].data)).to.equal('super');
        expect(fulltext.match(data[1].data)).to.equal('super');
        done();
      }

      parser.sentences = [test()];
      es.readArray(['supers'])
        .pipe(parser)
        .pipe(es.writeArray(callback));
    });
  });

  it('creates an array from the values of the children', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.repeat({
          id: 'testId',
          separator: lacona.literal({text: 'man'}),
          child: lacona.literal({
            text: 'super',
            value: 'testValue',
            id: 'subElementId'
          })
        });
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(data[1].data.result.testId).to.deep.equal(['testValue', 'testValue']);
      expect(data[1].data.result.subElementId).to.be.undefined;
      done();
    }

    parser.sentences = [test()];
    es.readArray(['supermans'])
    .pipe(parser)
    .pipe(es.writeArray(callback));
  });

  it('does not accept fewer than min iterations', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.repeat({
          min: 2,
          child: lacona.literal({text: 'a'}),
          separator: lacona.literal({text: 'b'})
        });
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.match(data[1].data)).to.equal('a');
      expect(fulltext.suggestion(data[1].data)).to.equal('b');
      expect(fulltext.completion(data[1].data)).to.equal('a');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['a'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });


  it('does not accept more than max iterations', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.repeat({
          max: 1,
          child: lacona.literal({text: 'a'}),
          separator: lacona.literal({text: 'b'})
        });
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('');
      expect(fulltext.match(data[1].data)).to.equal('a');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['a'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('passes on its category', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.repeat({
          category: 'myCat',
          child: lacona.literal({text: 'a'})
        });
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(4);
      expect(data[1].data.match[0].category).to.equal('myCat');
      expect(data[2].data.match[0].category).to.equal('myCat');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['a'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  describe('unique', function () {
    var test;

    beforeEach(function () {
      test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return lacona.repeat({
            unique: true,
            child: lacona.choice({
              children: [
                lacona.literal({text: 'a', value: 'a'}),
                lacona.literal({text: 'b', value: 'b'})
              ]
            })
          });
        }
      });
    });

    it('rejects non-unique repeated elements', function (done) {
      function callback(err, data) {
        expect(data).to.have.length(2);
        done();
      }

      parser.sentences = [test()];
      es.readArray(['aa'])
        .pipe(parser)
        .pipe(es.writeArray(callback));
    });

    it('accepts unique repeated elements', function (done) {
      function callback(err, data) {
        expect(data).to.have.length(3);
        expect(fulltext.match(data[1].data)).to.equal('ab');
        done();
      }

      parser.sentences = [test()];
      es.readArray(['ab'])
        .pipe(parser)
        .pipe(es.writeArray(callback));
    });
  });
});
