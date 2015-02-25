/** @jsx createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import {createElement} from '../lib/create-element'

describe('sequence', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('puts two elements in order', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('man')
      expect(data[1].data.result).to.be.empty
      done()
    }

    parser.sentences = [
      <sequence>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    ]
    es.readArray(['superm'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('handles a separator', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('man')
      expect(data[1].data.result).to.be.empty
      done()
    }

    parser.sentences = [
      <sequence>
        <content>
          <literal text='super' />
          <literal text='man' />
        </content>
        <separator>
          <literal text=' ' />
        </separator>
      </sequence>
    ]
    es.readArray(['super m'])
    .pipe(parser)
    .pipe(es.writeArray(callback))
  })

  it('handles an optional child with a separator', function (done) {

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(4)
      expect(fulltext.suggestion(data[1].data)).to.equal('man')
      expect(fulltext.suggestion(data[2].data)).to.equal('maximum')
      done()
    }

    parser.sentences = [
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional={true} />
        <literal text='man' />
      </sequence>
    ]
    es.readArray(['superm'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('can set a value to the result', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.result).to.equal('testValue')
      done()
    }

    parser.sentences = [
      <sequence value='testValue'>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    ]

    es.readArray(['superm'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('passes on its category', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.match[0].category).to.equal('myCat')
      expect(data[1].data.suggestion[0].category).to.equal('myCat')
      done()
    }

    parser.sentences = [
      <sequence category='myCat'>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    ]
    es.readArray(['superm'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
