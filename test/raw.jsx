/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'

import { expect } from 'chai'

describe('raw', () => {
  it('adds to words, sets text and result', () => {
    function func (option) {
      expect(option).to.eql({
        text: 't',
        words: [],
        score: 1,
        callbacks: [],
        qualifiers: [],
        arguments: [],
        categories: [],
        annotations:[]
      })
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
      qualifiers: [],
      arguments: [],
      categories: [],
      annotations:[]
    }])
  })

  it('adds to words, sets text and result with a generator', () => {
    function * func (option) {
      expect(option).to.eql({
        text: 't',
        words: [],
        score: 1,
        callbacks: [],
        qualifiers: [],
        arguments: [],
        categories: [],
        annotations:[]
      })

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
      qualifiers: [],
      arguments: [],
      categories: [],
      annotations:[]
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
      qualifiers: [],
      arguments: [],
      categories: [],
      annotations:[]
    }])
  })

  it('can set additions', () => {
    function func (input) {
      return [{
        remaining: null,
        result: 'val',
        words: [{text: 'tex', input: false}],
        qualifiers: ['a'],
        annotation: 'a',
        categories: ['a'],
        argument: 'a'
      }]
    }

    const options = compileAndTraverse(<raw func={func} />, 't')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'tex', input: false}],
      result: 'val',
      score: 1,
      qualifiers: [{value: 'a', start: 0, end: 1}],
      arguments: [{value: 'a', start: 0, end: 1}],
      categories: [{value: 'a', start: 0, end: 1}],
      annotations: [{value: 'a', start: 0, end: 1}]
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
      qualifiers: [],
      arguments: [],
      categories: [],
      annotations:[]
    }])
  })
})
