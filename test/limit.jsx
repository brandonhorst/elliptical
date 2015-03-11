/** @jsx phrase.createElement */
/* eslint-env mocha */
import es from 'event-stream'
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('limit', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  describe('value', function () {
    it('limits calls to data', function (done) {
      function compute(input) {
        return [
          {text: 'testa'},
          {text: 'testb'},
          {text: 'testc'}
        ]
      }

      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(4)
        expect(fulltext.all(data[1].data)).to.equal('testa')
        expect(fulltext.all(data[2].data)).to.equal('testb')
        done()
      }

      parser.sentences = [<value limit={2} compute={compute} />]
      es.readArray(['test'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })

    it('accepts fewer than limit', function (done) {
      function compute(input, data, done) {
        return [
          {text: 'testa'},
          {text: 'testb'}
        ]
      }

      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(4)
        expect(fulltext.all(data[1].data)).to.equal('testa')
        expect(fulltext.all(data[2].data)).to.equal('testb')
        done()
      }

      parser.sentences = [<value limit={3} compute={compute} />]
      es.readArray(['test'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })
  })

  describe('choice', function () {
    it('can be restricted by a limit of 1', function (done) {
      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(3)
        expect(fulltext.suggestion(data[1].data)).to.equal('right')
        expect(data[1].data.result).to.equal('testValue')
        done()
      }

      parser.sentences = [
        <choice limit={1}>
          <literal text='right' value='testValue' />
          <literal text='right also' value='also' />
        </choice>
      ]
      es.readArray(['r'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })

    it('can be restricted by a limit of more than 1', function (done) {
      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(4)
        expect(fulltext.suggestion(data[1].data)).to.equal('right')
        expect(fulltext.suggestion(data[2].data)).to.equal('right also')
        done()
      }

      parser.sentences = [
        <choice limit={2}>
          <literal text='right' />
          <literal text='right also' />
          <literal text='right but excluded' />
        </choice>
      ]
      es.readArray(['r'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })

    it('still works when a limited child has multiple options', function (done) {
      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(5)
        expect(fulltext.suggestion(data[1].data)).to.equal('right')
        expect(fulltext.suggestion(data[2].data)).to.equal('right also')
        expect(fulltext.suggestion(data[3].data)).to.equal('right third')
        done()
      }

      parser.sentences = [
        <choice limit={2}>
          <choice>
            <literal text='right' />
            <literal text='right also' />
          </choice>
          <literal text='wrong' />
          <literal text='right third' />
        </choice>
      ]
      es.readArray(['r'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })

    it('limits even if valid parses do not parse to completion', function (done) {
      function callback (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.length(3)
        expect(fulltext.match(data[1].data)).to.equal('right')
        expect(fulltext.suggestion(data[1].data)).to.equal('also')
        done()
      }

      parser.sentences = [
        <sequence>
          <choice limit={1}>
            <literal text='rightalso' />
            <literal text='right' />
          </choice>
          <literal text='also' />
        </sequence>
      ]
      es.readArray(['righta'])
        .pipe(parser)
        .pipe(es.writeArray(callback))
    })
  })
})
