/*eslint-env mocha*/
import chai from 'chai'
import es from 'event-stream'
var expect = chai.expect
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'

describe('choice', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('suggests one valid choice', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.choice({children: [
          lacona.literal({text: 'right'}),
          lacona.literal({text: 'wrong'})
        ]})
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('right')
      expect(data[1].data.result).to.be.empty
      done()
    }

    parser.sentences = [test()]
    es.readArray(['r'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('suggests multiple valid choices', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.choice({children: [
          lacona.literal({text: 'right'}),
          lacona.literal({text: 'right also'})
        ]})
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(4)
      expect(fulltext.suggestion(data[1].data)).to.contain('right')
      expect(data[1].data.result).to.be.empty
      expect(fulltext.suggestion(data[2].data)).to.contain('right')
      expect(data[2].data.result).to.be.empty
      done()
    }

    parser.sentences = [test()]
    es.readArray(['r'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('suggests no valid choices', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.choice({children: [
          lacona.literal({text: 'wrong'}),
          lacona.literal({text: 'wrong also'})
        ]})
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(2)
      done()
    }

    parser.sentences = [test()]
    es.readArray(['r'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('adopts the value of the child', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.choice({
          id: 'testId',
          children: [
            lacona.literal({
              id: 'subId',
              text: 'right',
              value: 'testValue'
            }),
            lacona.literal({text: 'wrong'})
          ]
        })
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('right')
      expect(data[1].data.result.testId).to.equal('testValue')
      expect(data[1].data.result.subId).to.equal('testValue')
      done()
    }

    parser.sentences = [test()]
    es.readArray(['r'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('passes on its category', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.choice({
          category: 'myCat',
          children: [
            lacona.literal({text: 'aaa'}),
            lacona.literal({text: 'aab'})
          ]
        })
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(4)
      expect(data[1].data.suggestion[0].category).to.equal('myCat')
      expect(data[2].data.suggestion[0].category).to.equal('myCat')
      done()
    }

    parser.sentences = [test()]
    es.readArray(['aa'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
