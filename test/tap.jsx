/* eslint-env mocha */

import element from '../src/element'
import {reconcileAndTraverse} from './_util'
import chai, {expect} from 'chai'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)

describe('tap', () => {
  it('calls inbound and outbound when traversed', () => {
    const inSpy = spy()
    const outSpy = spy()

    const grammar = (
      <tap inbound={inSpy} outbound={outSpy}>
        <literal text='literal' />
      </tap>
    )

    reconcileAndTraverse(grammar, '')

    expect(inSpy).to.have.been.calledOnce
    expect(inSpy.args[0][0]).to.eql({
      text: '',
      words: [],
      score: 1,
      qualifiers: [],
      callbacks: [],
      _previousEllipsis: []
    })

    expect(outSpy).to.have.been.calledOnce
    expect(outSpy.args[0][0]).to.eql({
      text: null,
      words: [{text: 'literal', input: false}],
      score: 1,
      result: undefined,
      qualifiers: [],
      callbacks: [],
      _previousEllipsis: []
    })
  })
})
