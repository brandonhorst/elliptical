/** @jsx createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import {createElement} from '../lib/create-element'

describe('repeat', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('does not accept input that does not match the child', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(2)
      done()
    }

    parser.sentences = [
      <repeat>
        <content><literal text='super' /></content>
        <separator><literal text='man' /></separator>
      </repeat>
    ]
    es.readArray(['wrong'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('accepts the child on its own', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('man')
      done()
    }

    parser.sentences = [
      <repeat>
        <content><literal text='super' /></content>
        <separator><literal text='man' /></separator>
      </repeat>
    ]
    es.readArray(['superm'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('accepts the child twice, with the separator in the middle', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('super')
      done()
    }

    parser.sentences = [
      <repeat>
        <content><literal text='super' /></content>
        <separator><literal text='man' /></separator>
      </repeat>
    ]
    es.readArray(['supermans'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('does not accept input that does not match the child', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(2)
      done()
    }

    parser.sentences = [
      <repeat>
        <literal text='super' />
      </repeat>
    ]
    es.readArray(['wrong'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('accepts the child on its own', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('super')
      done()
    }

    parser.sentences = [
      <repeat>
        <literal text='super' />
      </repeat>
    ]
    es.readArray(['sup'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('accepts the child twice', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('super')
      expect(fulltext.match(data[1].data)).to.equal('super')
      done()
    }

    parser.sentences = [
      <repeat>
        <literal text='super' />
      </repeat>
    ]
    es.readArray(['supers'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('creates an array from the values of the children', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.result).to.deep.equal(['testValue', 'testValue'])
      expect(data[1].data.result.subElementId).to.be.undefined
      done()
    }

    parser.sentences = [
      <repeat>
        <literal text='super' value='testValue' id='subElementId' />
      </repeat>
    ]
    es.readArray(['supers'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('does not pass on child values to phrases', function (done) {
    class Test {
      describe() {
        return (
          <repeat id='testId'>
            <literal text='super' value='testValue' id='subElementId' />
          </repeat>
        )
      }
    }

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.result.testId).to.deep.equal(['testValue', 'testValue'])
      expect(data[1].data.result.subElementId).to.be.undefined
      done()
    }

    parser.sentences = [<Test />]
    es.readArray(['supers'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('does not accept fewer than min iterations', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.match(data[1].data)).to.equal('a')
      expect(fulltext.suggestion(data[1].data)).to.equal('b')
      expect(fulltext.completion(data[1].data)).to.equal('a')
      done()
    }

    parser.sentences = [
      <repeat min={2}>
        <content><literal text='a' /></content>
        <separator><literal text='b' /></separator>
      </repeat>
    ]
    es.readArray(['a'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('does not accept more than max iterations', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('')
      expect(fulltext.match(data[1].data)).to.equal('a')
      done()
    }

    parser.sentences = [
      <repeat max={1}>
        <content><literal text='a' /></content>
        <separator><literal text='b' /></separator>
      </repeat>
    ]
    es.readArray(['a'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('passes on its category', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(4)
      expect(data[1].data.match[0].category).to.equal('myCat')
      expect(data[2].data.match[0].category).to.equal('myCat')
      done()
    }

    parser.sentences = [
    <repeat category='myCat'>
      <literal text='a' />
    </repeat>
    ]
    es.readArray(['a'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('rejects non-unique repeated elements', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(2)
      done()
    }

    parser.sentences = [
      <repeat unique={true}>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </repeat>
    ]
    es.readArray(['aa'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('accepts unique repeated elements', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.match(data[1].data)).to.equal('ab')
      done()
    }

    parser.sentences = [
      <repeat unique={true}>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </repeat>
    ]
    es.readArray(['ab'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
