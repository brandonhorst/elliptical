/** @jsx createElement */
/* eslint-env mocha */
import {createElement, Phrase} from 'lacona-phrase'
import chai, {expect} from 'chai'
import {Parser} from '..'
import {text} from './_util'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('freetext', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('filters input', () => {
    function filter (input) {
      return input === 'validValue'
    }

    parser.grammar = <freetext filter={filter} />

    const data1 = parser.parseArray('validValue')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('validValue')
    expect(data1[0].result).to.equal('validValue')

    const data2 = parser.parseArray('invalidValue')
    expect(data2).to.have.length(0)
  })

  it('no filter always accepts', () => {
    parser.grammar = <freetext id='test' />

    const data = parser.parseArray('anything')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('anything')
    expect(data[0].result).to.equal('anything')
  })

  it('allows consumeAll', () => {
    const filterSpy = spy()

    function filter (input) {
      filterSpy()
      return input === 'validValue'
    }

    parser.grammar = <freetext filter={filter} consumeAll />

    const data = parser.parseArray('validValue')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('validValue')
    expect(filterSpy).to.have.been.calledOnce
  })

  it('allows splits on strings', () => {
    class Test extends Phrase {
      describe () {
        return (
          <sequence>
            <freetext splitOn=' ' id='freetext' />
            <choice>
              <literal text=' test' />
              <literal text='thing' />
            </choice>
          </sequence>
        )
      }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('anything goes test')
    expect(data).to.have.length(3)
    expect(text(data[0])).to.equal('anything goes test')
    expect(data[0].result.freetext).to.equal('anything goes')
    expect(text(data[1])).to.equal('anything goes test test')
    expect(data[1].result.freetext).to.equal('anything goes test')
    expect(text(data[2])).to.equal('anything goes testthing')
    expect(data[2].result.freetext).to.equal('anything goes test')
  })

  it('allows splits on regex (with weird parens)', () => {
    class Test extends Phrase {
      describe () {
        return (
          <sequence>
            <freetext splitOn={/(( )())/} id='freetext' />
            <choice>
              <literal text=' test' />
              <literal text='thing' />
            </choice>
          </sequence>
        )
      }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('anything goes test')
    expect(data).to.have.length(3)
    expect(text(data[0])).to.equal('anything goes test')
    expect(data[0].result.freetext).to.equal('anything goes')
    expect(text(data[1])).to.equal('anything goes test test')
    expect(data[1].result.freetext).to.equal('anything goes test')
    expect(text(data[2])).to.equal('anything goes testthing')
    expect(data[2].result.freetext).to.equal('anything goes test')
  })
})
