/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'

import { expect } from 'chai'

describe('dynamic', () => {
  it('is passed the input', () => {
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

  it('is passed the option, with complete sequences in the result', () => {
    function describe (input, option) {
      expect(input).to.eql('test')
      expect(option.result).to.eql({prefix: 'val'})
      return <literal text='test' value='test'/>
    }
    const options = compileAndTraverse(
      <sequence>
        <literal text='a ' value='val' id='prefix' />
        <dynamic describe={describe} consumeAll id='dynamic' />
      </sequence>
    , 'a test')

    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'a ', input: true},
        {text: 'test', input: true}
      ],
      result: {
        prefix: 'val',
        dynamic: 'test'
      },
      score: 1,
      qualifiers: [],
      annotations: [],
      categories: [],
      arguments: []
    }])
  })
})
