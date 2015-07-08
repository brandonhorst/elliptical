/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('decorator', () => {
  let parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('suggests a decoration', () => {
    parser.grammar = (
      <sequence>
        <literal text='a' />
        <decorator text='b' />
      </sequence>
    )

    const data = parser.parseArray('a')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('ab')
  })

  it('decorates an input', () => {
    parser.grammar = (
      <sequence>
        <decorator text='b' />
        <literal text='a' />
      </sequence>
    )

    const data = parser.parseArray('a')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('ba')
  })

  it('decorates an freetext', () => {
    parser.grammar = (
      <sequence>
        <decorator text='x ' />
        <freetext id='test' />
      </sequence>
    )

    const data = parser.parseArray('x superman')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('x superman')
    expect(data[0].result.test).to.equal('superman')
  })

  it('decorates an placeholder', () => {
    parser.grammar = (
      <sequence>
        <literal text='s' />
        <decorator text='x ' />
        <placeholder text='test' id='test'>
          <freetext />
        </placeholder>
      </sequence>
    )

    const data = parser.parseArray('ssuperman')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('sx superman')
    expect(data[0].result.test).to.equal('superman')
  })
})
