/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'

import { expect } from 'chai'

describe('dynamic', () => {
  it('can describe a literal', () => {
    function describe (input) {
      expect(input).to.eql('test')
      return <literal text='test' value='test'/>
    }
    const options = compileAndTraverse(
      <dynamic describe={describe} consumeAll />
    , 'test')

    expect(options).to.eql([{
      text: '',
      words: [{text: 'test', input: true}],
      result: 'test',
      score: 1,
      qualifiers: [],
      annotations: [],
      categories: [],
      arguments: []
    }])
  })
})
