/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('score', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('every parse output has a numeric score', () => {
    parser.grammar = <literal text='test' />

    const data = parser.parseArray('')

    expect(data).to.have.length(1)
    expect(data[0].score).to.equal(1)
  })

  it('score is passed on from literals through choices', () => {
    parser.grammar = (
      <choice>
        <literal text='right' score={0.5} />
        <literal text='rightFirst' score={1} />
      </choice>
    )

    const data = parser.parseArray('right')
    expect(data).to.have.length(2)
    expect(data[0].score).to.equal(0.5)
    expect(data[1].score).to.equal(1)
  })

  it('sequence multiplies all scores together', () => {
    parser.grammar = (
      <sequence>
        <literal text='a' score={0.5} />
        <literal text='b' score={0.5} />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(data[0].score).to.equal(0.25)
  })
})
