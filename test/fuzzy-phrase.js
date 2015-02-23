/*eslint-env mocha*/
var chai = require('chai')
var es = require('event-stream')
var expect = chai.expect
var fulltext = require('lacona-util-fulltext')
var lacona = require('..')

describe('fuzzy: phrase', function () {
  var parser
  beforeEach(function () {
    parser = new lacona.Parser({fuzzy: 'phrase'})
  })

  describe('basic usage', function () {
    var test

    beforeEach(function () {
      test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return lacona.literal({text: 'a simple test'})
        }
      })
    })

    it('supports fuzzy matching within a phrase', function (done) {
      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(3)
        expect(fulltext.suggestion(data[1].data)).to.equal('a simple test')
        expect(data[1].data.suggestion[0].string).to.equal('a')
        expect(data[1].data.suggestion[0].input).to.be.true
        expect(data[1].data.suggestion[1].string).to.equal(' ')
        expect(data[1].data.suggestion[1].input).to.be.false
        expect(data[1].data.suggestion[2].string).to.equal('s')
        expect(data[1].data.suggestion[2].input).to.be.true
        expect(data[1].data.suggestion[3].string).to.equal('i')
        expect(data[1].data.suggestion[3].input).to.be.false
        expect(data[1].data.suggestion[4].string).to.equal('m')
        expect(data[1].data.suggestion[4].input).to.be.true
        expect(data[1].data.suggestion[5].string).to.equal('p')
        expect(data[1].data.suggestion[5].input).to.be.false
        expect(data[1].data.suggestion[6].string).to.equal('l')
        expect(data[1].data.suggestion[6].input).to.be.true
        expect(data[1].data.suggestion[7].string).to.equal('e ')
        expect(data[1].data.suggestion[7].input).to.be.false
        expect(data[1].data.suggestion[8].string).to.equal('te')
        expect(data[1].data.suggestion[8].input).to.be.true
        expect(data[1].data.suggestion[9].string).to.equal('st')
        expect(data[1].data.suggestion[9].input).to.be.false
        done()
      }

      parser.sentences = [test()]
      es.readArray(['asmlte'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
    })

    it('rejects misses properly with fuzzy matching', function (done) {
      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(2)
        done()
      }

      parser.sentences = [test()]
      es.readArray(['fff'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
    })

    it('suggests properly when fuzzy matching is enabled', function (done) {
      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(3)
        expect(data[1].data.suggestion[0].string).to.equal('a simple test')
        expect(data[1].data.suggestion[0].input).to.be.false
        expect(fulltext.suggestion(data[1].data)).to.equal('a simple test')
        done()
      }

      parser.sentences = [test()]
      es.readArray([''])
      .pipe(parser)
      .pipe(es.writeArray(callback))
    })
  })

  it('can do fuzzy matching with regex special characters', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.literal({text: '[whatever]'})
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('[whatever]')
      expect(data[1].data.suggestion[0].string).to.equal('[')
      expect(data[1].data.suggestion[0].input).to.be.true
      expect(data[1].data.suggestion[1].string).to.equal('whatever')
      expect(data[1].data.suggestion[1].input).to.be.false
      expect(data[1].data.suggestion[2].string).to.equal(']')
      expect(data[1].data.suggestion[2].input).to.be.true
      done()
    }

    parser.sentences = [test()]
    es.readArray(['[]'])
    .pipe(parser)
    .pipe(es.writeArray(callback))
  })

  describe('sequence', function () {
    var test
    beforeEach(function () {
      test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return lacona.sequence({children: [
            lacona.literal({text: 'abc'}),
            lacona.literal({text: 'def'})
          ]})
        }
      })
    })

    it('supports sequence when fuzzy is enabled', function (done) {
      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(3)
        expect(fulltext.suggestion(data[1].data)).to.equal('def')
        expect(fulltext.match(data[1].data)).to.equal('abc')
        expect(data[1].data.suggestion[0].string).to.equal('d')
        expect(data[1].data.suggestion[0].input).to.be.false
        expect(data[1].data.suggestion[1].string).to.equal('e')
        expect(data[1].data.suggestion[1].input).to.be.true
        expect(data[1].data.suggestion[2].string).to.equal('f')
        expect(data[1].data.suggestion[2].input).to.be.false
        done()
      }

      parser.sentences = [test()]
      es.readArray(['abce'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })

    it('rejects when the word itself does not complete the match', function (done) {
      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(2)
        done()
      }

      parser.sentences = [test()]
      es.readArray(['ad'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })
  })
})
