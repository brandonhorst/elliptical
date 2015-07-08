/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('choice', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('suggests one valid choice', () => {
    parser.grammar = (
      <choice>
        <literal text='right' />
        <literal text='wrong' />
      </choice>
    )

    const data = parser.parseArray('r')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('right')
    expect(data[0].result).to.be.empty
  })

  it('suggests multiple valid choices', () => {
    parser.grammar = (
      <choice>
        <literal text='right' />
        <literal text='right also' />
      </choice>
    )

    const data = parser.parseArray('r')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('right')
    expect(data[0].result).to.be.empty
    expect(text(data[1])).to.equal('right also')
    expect(data[0].result).to.be.empty
  })

  it('suggests no valid choices', () => {
    parser.grammar = (
      <choice>
        <literal text='wrong' />
        <literal text='wrong also' />
      </choice>
    )

    const data = parser.parseArray('r')
    expect(data).to.have.length(0)
  })

  it('adopts the value of the child (even if it has no id)', () => {
    parser.grammar = (
      <choice>
        <literal text='right' value='testValue' />
        <literal text='wrong' />
      </choice>
    )

    const data = parser.parseArray('r')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('right')
    expect(data[0].result).to.equal('testValue')
  })

  it('adopts the value of the child', () => {
    class Test extends phrase.Phrase {
      describe() {
        return (
          <choice>
            <literal text='right' value='testValue' />
            <literal text='wrong' />
          </choice>
        )
      }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('r')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('right')
    expect(data[0].result).to.equal('testValue')
  })

  it('can set a value', () => {
    class Test extends phrase.Phrase {
      describe() {
        return (
          <choice value='override'>
            <literal text='right' value='testValue' />
            <literal text='wrong' />
          </choice>
        )
      }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('r')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('right')
    expect(data[0].result).to.equal('override')
  })

  it('can set a value in an object with a key', () => {
    class Test extends phrase.Phrase {
      describe() {
        return (
          <choice>
            <literal text='right' value='testValue' id='key' />
            <literal text='wrong' />
          </choice>
        )
      }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('r')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('right')
    expect(data[0].result).to.eql({key: 'testValue'})
  })

  it('ignores strings and nulls for reconciliation', () => {
    class Test extends phrase.Phrase {
      describe() {
        return (
          <choice>
            {null}
            <literal text='test' />
            someString
          </choice>
        )
      }
    }

    parser.grammar = <Test />
    const data = parser.parseArray('test')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
  })
})
