/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse, text} from './_util'
import {expect} from 'chai'

describe('qualifiers', () => {
  it('are exported from elements', () => {
    const grammar = <literal text='test' qualifiers={['qual', 'ifier']} />

    const options = compileAndTraverse(grammar, '')
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

    const options = compileAndTraverse(grammar, '')
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

    const options = compileAndTraverse(grammar, 'test')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(options[0].qualifiers).to.eql(['qual'])
  })

  it('can be nested', () => {
    const grammar = (
      <choice qualifiers={['qual']}>
        <literal text='test' qualifiers={['ifier']} />
        <literal text='wrong' qualifiers={['wrong']} />
      </choice>
    )

    const options = compileAndTraverse(grammar, 'test')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(options[0].qualifiers).to.eql(['qual', 'ifier'])
  })

  it('are passed through by repeats', () => {
    const grammar = (
      <repeat>
        <label argument={false} text='place'>
          <literal text='test' qualifiers={['qual']} />
        </label>
      </repeat>
    )

    const options = compileAndTraverse(grammar, 'testte')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('testtest')
    expect(options[0].qualifiers).to.eql(['qual', 'qual'])
  })
})
