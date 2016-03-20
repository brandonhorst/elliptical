/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse, text} from './_util'
import {expect} from 'chai'

describe('score', () => {
  it('every parse output has a numeric score', () => {
    const grammar = <literal text='test' />

    const options = compileAndTraverse(grammar, '')

    expect(options).to.have.length(1)
    expect(options[0].score).to.equal(1)
  })

  it('score is passed on from literals through choices', () => {
    const grammar = (
      <choice>
        <literal text='right' score={0.5} />
        <literal text='rightFirst' score={1} />
      </choice>
    )

    const options = compileAndTraverse(grammar, 'right')
    expect(options).to.have.length(2)
    expect(text(options[0])).to.equal('rightFirst')
    expect(options[0].score).to.equal(1)
    expect(text(options[1])).to.equal('right')
    expect(options[1].score).to.equal(0.5)
  })

  it('sequence multiplies all scores together', () => {
    const grammar = (
      <sequence>
        <literal text='a' score={0.5} />
        <literal text='b' score={0.5} />
      </sequence>
    )

    const options = compileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(options[0].score).to.equal(0.25)
  })
})
