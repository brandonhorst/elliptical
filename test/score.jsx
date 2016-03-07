/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'
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
    expect(options[0].score).to.equal(0.5)
    expect(options[1].score).to.equal(1)
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
