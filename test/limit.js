/*eslint-env mocha*/
import {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'

describe('limit', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  describe('value', function () {
    it('limits calls to data', function (done) {
      var test = lacona.createPhrase({
        name: 'test/test',
        compute: function (input, data, done) {
          data({text: 'testa'})
          data({text: 'testb'})
          data({text: 'testc'})
          done()
        },
        describe: function () {
          return lacona.value({limit: 2, compute: this.compute})
        }
      })

      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(4)
        expect(fulltext.all(data[1].data)).to.equal('testa')
        expect(fulltext.all(data[2].data)).to.equal('testb')
        done()
      }

      parser.sentences = [test()]
      es.readArray(['test'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })

    it('accepts fewer than limit', function (done) {
      var test = lacona.createPhrase({
        name: 'test/test',
        compute: function (input, data, done) {
          data({text: 'testa'})
          data({text: 'testb'})
          done()
        },
        describe: function () {
          return lacona.value({limit: 3, compute: this.compute})
        }
      })

      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(4)
        expect(fulltext.all(data[1].data)).to.equal('testa')
        expect(fulltext.all(data[2].data)).to.equal('testb')
        done()
      }

      parser.sentences = [test()]
      es.readArray(['test'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })
  })

  describe('choice', function () {
    it('can be restricted by a limit of 1', function (done) {
      var test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return lacona.choice({
            limit: 1,
            children: [
              lacona.literal({text: 'right'}),
              lacona.literal({text: 'right also'})
            ]
          })
        }
      })

      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(3)
        expect(fulltext.suggestion(data[1].data)).to.equal('right')
        done()
      }

      parser.sentences = [test()]
      es.readArray(['r'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })

    it('has a value when limited', function (done) {
      var test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return lacona.choice({
            id: 'testId',
            limit: 1,
            children: [
              lacona.literal({
                id: 'subId',
                text: 'right',
                value: 'testValue'
              }),
              lacona.literal({text: 'right also'})
            ]
          })
        }
      })

      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(3)
        expect(data[1].data.result.testId).to.equal('testValue')
        expect(data[1].data.result.subId).to.equal('testValue')
        done()
      }

      parser.sentences = [test()]
      es.readArray(['r'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })

    it('can be restricted by a limit of more than 1', function (done) {
      var test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return lacona.choice({
            limit: 2,
            children: [
              lacona.literal({text: 'right'}),
              lacona.literal({text: 'right also'}),
              lacona.literal({text: 'right but excluded'})
            ]
          })
        }
      })

      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(4)
        expect(fulltext.suggestion(data[1].data)).to.contain('right')
        expect(fulltext.suggestion(data[2].data)).to.contain('right')
        done()
      }

      parser.sentences = [test()]
      es.readArray(['r'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })

    it('still works when a limited child has multiple options', function (done) {
      var test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return lacona.choice({
            limit: 2,
            children: [
              lacona.choice({children: [
                lacona.literal({text: 'right'}),
                lacona.literal({text: 'right also'})
              ]}),
              lacona.literal({text: 'wrong'}),
              lacona.literal({text: 'right third'})
            ]
          })
        }
      })

      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(5)
        expect(fulltext.suggestion(data[1].data)).to.equal('right')
        expect(fulltext.suggestion(data[2].data)).to.equal('right also')
        expect(fulltext.suggestion(data[3].data)).to.equal('right third')
        done()
      }

      parser.sentences = [test()]
      es.readArray(['r'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })
  })
})
