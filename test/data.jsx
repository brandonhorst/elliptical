/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse, text} from './_util'
import {expect} from 'chai'

describe('data', () => {
  it('passes data to output', () => {
    const grammar = <literal text='test' data={3} />

    const options = compileAndTraverse(grammar, '')

    expect(options).to.have.length(1)
    expect(options[0].data).to.eql([3])
  })

  it('sequence handles data', () => {
    const grammar = (
      <sequence>
        <literal text='test' data={2} />
        <literal text='test' data={3} />
      </sequence>
    )

    const options = compileAndTraverse(grammar, '')

    expect(options).to.have.length(1)
    expect(options[0].data).to.eql([2, 3])
  })

  it('sequence and choice can have data', () => {
    const grammar = (
      <sequence data={1}>
        <literal text='test' data={2} />
        <choice data={3}>
          <literal text='a' data={4} />
          <literal text='b' data={5} />
        </choice>
      </sequence>
    )

    const options = compileAndTraverse(grammar, 'testa')

    expect(options).to.have.length(1)
    expect(options[0].data).to.eql([1, 2, 3, 4])
  })
})
