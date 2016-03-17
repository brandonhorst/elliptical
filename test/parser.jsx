/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import createParser from '../src/parser'
import {expect} from 'chai'

describe('parser', () => {
  it('parse traverses', () => {
    const Test = {
      describe () {
        return <literal text='test' />
      }
    }
    const {parse} = createParser(<Test />)

    const outputs = parse('t')

    expect(outputs).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }])
  })
})
