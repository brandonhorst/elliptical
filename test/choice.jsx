/** @jsx createElement */
/* eslint-env mocha */
import {install} from 'source-map-support'
import {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import {createElement} from '../lib/create-element'

install()

describe('choice', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('suggests one valid choice', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('right')
      expect(data[1].data.result).to.be.empty
      done()
    }

    parser.sentences = [
      <choice>
        <literal text='right' />
        <literal text='wrong' />
      </choice>
    ]

    es.readArray(['r'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('suggests multiple valid choices', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(4)
      expect(fulltext.suggestion(data[1].data)).to.contain('right')
      expect(data[1].data.result).to.be.empty
      expect(fulltext.suggestion(data[2].data)).to.contain('right')
      expect(data[2].data.result).to.be.empty
      done()
    }

    parser.sentences = [
      <choice>
        <literal text='right' />
        <literal text='right also' />
      </choice>
    ]
    es.readArray(['r'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('suggests no valid choices', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(2)
      done()
    }

    parser.sentences = [
      <choice>
        <literal text='wrong' />
        <literal text='wrong also' />
      </choice>
    ]
    es.readArray(['r'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('adopts the value of the child', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('right')
      expect(data[1].data.result).to.equal('testValue')
      done()
    }

    parser.sentences = [
      <choice>
        <literal text='right' value='testValue' />
        <literal text='wrong' />
      </choice>
    ]
    es.readArray(['r'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('passes on its category', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(4)
      expect(data[1].data.suggestion[0].category).to.equal('myCat')
      expect(data[2].data.suggestion[0].category).to.equal('myCat')
      done()
    }

    parser.sentences = [
      <choice category='myCat'>
        <literal text='aaa' />
        <literal text='aab' />
      </choice>
    ]
    es.readArray(['aa'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
