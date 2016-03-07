/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'

import { expect } from 'chai'

describe('raw', () => {
  it('adds to words, sets text and result', () => {
    function func (input) {
      expect(input).to.equal('t')
      return [{
        remaining: null,
        result: 'val',
        words: [{text: 'tex', input: false}]
      }]
    }

    const options = compileAndTraverse(<raw func={func} />, 't')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'tex', input: false}],
      result: 'val',
      score: 1,
      qualifiers: []
    }])
  })

  it('adds to words, sets text and result with a generator', () => {
    function * func (input) {
      expect(input).to.equal('t')
      yield {
        remaining: null,
        result: 'val',
        words: [{text: 'tex', input: false}]
      }
    }

    const options = compileAndTraverse(<raw func={func} />, 't')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'tex', input: false}],
      result: 'val',
      score: 1,
      qualifiers: []
    }])
  })

  it('can set the score', () => {
    function func (input) {
      return [{
        remaining: null,
        result: 'val',
        words: [{text: 'tex', input: false}],
        score: 0.5
      }]
    }

    const options = compileAndTraverse(<raw func={func} />, 't')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'tex', input: false}],
      result: 'val',
      score: 0.5,
      qualifiers: []
    }])
  })

  it('can set the qualifiers', () => {
    function func (input) {
      return [{
        remaining: null,
        result: 'val',
        words: [{text: 'tex', input: false}],
        qualifiers: ['test']
      }]
    }

    const options = compileAndTraverse(<raw func={func} />, 't')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'tex', input: false}],
      result: 'val',
      score: 1,
      qualifiers: ['test']
    }])
  })

  it('can be limited', () => {
    function func (input) {
      return [{
        remaining: null,
        result: 'val',
        words: [{text: 'tex', input: false}]
      }, {
        remaining: null,
        result: 'val2',
        words: [{text: 'tex2', input: false}]
      }]
    }

    const options = compileAndTraverse(<raw func={func} limit={1} />, '')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'tex', input: false}],
      result: 'val',
      score: 1,
      qualifiers: []
    }])
  })
})
