/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'
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

    compileAndTraverse(grammar, '')

    expect(inSpy).to.have.been.calledOnce
    expect(inSpy.args[0][0]).to.eql({
      text: '',
      words: [],
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      callbacks: [],
      data: []
    })

    expect(outSpy).to.have.been.calledOnce
    expect(outSpy.args[0][0]).to.eql({
      text: null,
      words: [{text: 'literal', input: false}],
      score: 1,
      result: undefined,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      callbacks: [],
      data: []
    })
  })
})
