/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'

import { expect } from 'chai'

describe('list', () => {
  it('suggests normally', () => {
    const grammar = <list items={['testa', 'testb']} />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }])
  })

  it('suggests normally with contain', () => {
    const grammar = <list items={['testa', 'testb']} strategy='contain' />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }])
  })

  it('matches', () => {
    const grammar = <list items={['testa', 'testb']} />

    const options = compileAndTraverse(grammar, 'testb')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'testb', input: true}],
      result: undefined,
      score: 1,
      qualifiers: []
    }])
  })

  it('matches with contain', () => {
    const grammar = <list items={['testa', 'testb']} strategy='contain' />

    const options = compileAndTraverse(grammar, 'b')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'test', input: false}, {text: 'b', input: true}],
      result: undefined,
      score: 0.5,
      qualifiers: []
    }])
  })

  it('sorts with contain, and limits before it', () => {
    const grammar = <list
      items={['ztest', 'testz', 'zztest']}
      strategy='contain'
      limit={2} />

    const options = compileAndTraverse(grammar, 'test')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'test', input: true}, {text: 'z', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'z', input: false}, {text: 'test', input: true}],
      result: undefined,
      score: 0.5,
      qualifiers: []
    }])
  })

  it('allows for value', () => {
    const items = [{text: 'testa', value: 'a'}, {text: 'testb', value: 'b'}]
    const grammar = <list items={items} />

    const options = compileAndTraverse(grammar, 'testb')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'testb', input: true}],
      result: 'b',
      score: 1,
      qualifiers: []
    }])
  })

  it('allows for value with contain', () => {
    const items = [{text: 'testa', value: 'a'}, {text: 'testb', value: 'b'}]
    const grammar = <list items={items} strategy='contain' />

    const options = compileAndTraverse(grammar, 'b')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'test', input: false}, {text: 'b', input: true}],
      result: 'b',
      score: 0.5,
      qualifiers: []
    }])
  })

  it('allows for value override', () => {
    const items = ['testa', {text: 'testb', value: 'b'}, {text: 'testc'}]
    const grammar = <list items={items} value='override' />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: 'override',
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: 'override',
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'testc', input: false}],
      result: 'override',
      score: 1,
      qualifiers: []
    }])
  })

  it('outputs a qualifier', () => {
    const items = [{text: 'testa', qualifiers: ['desca', 'descb']}, 'testb']
    const grammar = <list items={items} />

    const options = compileAndTraverse(grammar, 'testa')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'testa', input: true}],
      result: undefined,
      score: 1,
      qualifiers: ['desca', 'descb']
    }])
  })

  it('outputs a qualifier with contain', () => {
    const items = [{text: 'testa', qualifiers: ['desca', 'descb']}, 'testb']
    const grammar = <list items={items} strategy='contain' />

    const options = compileAndTraverse(grammar, 'a')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'test', input: false}, {text: 'a', input: true}],
      result: undefined,
      score: 0.5,
      qualifiers: ['desca', 'descb']
    }])
  })
})
