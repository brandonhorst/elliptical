/* eslint-env mocha */

import element from '../src/element'
import {reconcileAndTraverse, text} from './_util'
import {expect} from 'chai'

describe('qualifiers', () => {
  it('are exported from elements', () => {
    const grammar = <literal text='test' qualifiers={['qual', 'ifier']} />

    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(options[0].qualifiers).to.eql(['qual', 'ifier'])
  })

  it('are joined by sequences', () => {
    const grammar = (
      <sequence>
        <literal text='te' qualifiers={['qual', 'ifier']} />
        <literal text='st' qualifiers={['test']} />
      </sequence>
    )

    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(options[0].qualifiers).to.eql(['qual', 'ifier', 'test'])
  })

  it('are passed through choices', () => {
    const grammar = (
      <choice>
        <literal text='test' qualifiers={['qual']} />
        <literal text='wrong' qualifiers={['ifier']} />
      </choice>
    )

    const options = reconcileAndTraverse(grammar, 'test')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(options[0].qualifiers).to.eql(['qual'])
  })

  it('are passed through by repeats', () => {
    const grammar = (
      <repeat>
        <label argument={false} text='place'>
          <literal text='test' qualifiers={['qual']} />
        </label>
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'testte')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('testtest')
    expect(options[0].qualifiers).to.eql(['qual', 'qual'])
  })
})
