/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
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
    expect(fulltext.all(data[0])).to.equal('ab')
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
    expect(fulltext.all(data[0])).to.equal('ba')
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
    expect(fulltext.all(data[0])).to.equal('ba')
  })
})
