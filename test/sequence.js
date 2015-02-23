/*eslint-env mocha*/
import chai from 'chai'
import es from 'event-stream'
var expect = chai.expect
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'

describe('sequence', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('puts two elements in order', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.sequence({children: [
          lacona.literal({text: 'super'}),
          lacona.literal({text: 'man'})
        ]})
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('man')
      expect(data[1].data.result).to.be.empty
      done()
    }

    parser.sentences = [test()]
    es.readArray(['superm'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('handles a separator', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.sequence({
          children: [
            lacona.literal({text: 'super'}),
            lacona.literal({text: 'man'})
          ],
          separator: lacona.literal({text: ' '})
        })
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('man')
      expect(data[1].data.result).to.be.empty
      done()
    }

    parser.sentences = [test()]
    es.readArray(['super m'])
    .pipe(parser)
    .pipe(es.writeArray(callback))
  })

  it('handles an optional child with a separator', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.sequence({
          children: [
            lacona.literal({text: 'super'}),
            lacona.literal({
              text: 'maximum',
              value: 'optionalValue',
              id: 'optionalId',
              optional: true
            }),
            lacona.literal({text: 'man'})
          ],
          separator: lacona.literal({text: ''})
        })
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(4)
      expect(fulltext.suggestion(data[1].data)).to.equal('man')
      expect(data[1].data.result).to.be.empty
      expect(data[2].data.result.optionalId).to.equal('optionalValue')
      expect(fulltext.suggestion(data[2].data)).to.equal('maximum')
      done()
    }

    parser.sentences = [test()]
    es.readArray(['superm'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('can set a value to the result', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.sequence({
          id: 'testId',
          value: 'testValue',
          children: [
            lacona.literal({text: 'super'}),
            lacona.literal({text: 'man'})
          ]
        })
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.result.testId).to.equal('testValue')
      done()
    }

    parser.sentences = [test()]
    es.readArray(['superm'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('passes on its category', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.sequence({
          category: 'myCat',
          children: [
            lacona.literal({text: 'super'}),
            lacona.literal({text: 'man'})
          ]
        })
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.match[0].category).to.equal('myCat')
      expect(data[1].data.suggestion[0].category).to.equal('myCat')
      done()
    }

    parser.sentences = [test()]
    es.readArray(['superm'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
