/** @jsx createElement */
/* eslint-env mocha */

import { expect } from 'chai'
import { text } from './_util'
import { Parser } from '..'
import { createElement, Phrase } from 'lacona-phrase'

describe('qualifiers', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('are exported from elements', () => {
    parser.grammar = <literal text='test' qualifiers={['qual', 'ifier']} />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
    expect(data[0].qualifiers).to.eql(['qual', 'ifier'])
  })

  it('are joined by sequences', () => {
    parser.grammar = (
      <sequence>
        <literal text='te' qualifiers={['qual', 'ifier']} />
        <literal text='st' qualifiers={['test']} />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
    expect(data[0].qualifiers).to.eql(['qual', 'ifier', 'test'])
  })

  it('are passed through choices', () => {
    parser.grammar = (
      <choice>
        <literal text='test' qualifiers={['qual']} />
        <literal text='wrong' qualifiers={['ifier']} />
      </choice>
    )

    const data = parser.parseArray('test')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
    expect(data[0].qualifiers).to.eql(['qual'])
  })

  it('are passed through by repeats', () => {
    parser.grammar = (
      <repeat>
        <label argument={false} text='place'>
          <literal text='test' qualifiers={['qual']} />
        </label>
      </repeat>
    )

    const data = parser.parseArray('testte')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('testtest')
    expect(data[0].qualifiers).to.eql(['qual', 'qual'])
  })
})
