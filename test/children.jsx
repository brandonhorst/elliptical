/** @jsx createElement */
/* eslint-env mocha */
import { expect } from 'chai'
import { Parser } from '..'
import { createElement, Phrase } from 'lacona-phrase'
import { text } from './_util'

describe('children', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('passes children as props', () => {
    class Test extends Phrase {
      describe () {
        expect(this.props.children).to.have.length(2)
        return this.props.children[1]
      }
    }

    parser.grammar = (
      <Test>
        <literal text='a' />
        <literal text='b' />
      </Test>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('b')
  })

  it('flattens children as props', () => {
    class Test extends Phrase {
      describe () {
        expect(this.props.children).to.have.length(3)
        return this.props.children[1]
      }
    }

    const literals = [<literal text='b' />, <literal text='c' />]
    parser.grammar = (
      <Test>
        <literal text='a' />
        {literals}
      </Test>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('b')
  })

  it('passes the child result', () => {
    class Test extends Phrase {
      describe () {
        return this.props.children[0]
      }
    }

    parser.grammar = (
      <Test>
        <literal text='a' value='b' />
      </Test>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('a')
    expect(data[0].result).to.equal('b')
  })
})
