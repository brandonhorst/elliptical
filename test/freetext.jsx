/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'

import chai, {expect} from 'chai'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('freetext', () => {
  it('filters input', () => {
    function filter (input) {
      return input === 'validValue'
    }

    const grammar = <freetext filter={filter} />
    let options

    options = compileAndTraverse(grammar, 'validValue')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'validValue', input: true}],
      result: 'validValue',
      score: options[0].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      data: []
    }])

    options = compileAndTraverse(grammar, 'invalidValue')
    expect(options).to.eql([])
  })

  it('no filter always accepts', () => {
    const grammar = <freetext id='test' />
    const options = compileAndTraverse(grammar, 'invalidValue')

    expect(options).to.eql([{
      text: '',
      words: [{text: 'invalidValue', input: true}],
      result: 'invalidValue',
      score: options[0].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      data: []
    }])
  })

  it('allows consumeAll', () => {
    const filterSpy = spy()

    function filter (input) {
      filterSpy()
      return input === 'validValue'
    }

    const grammar = <freetext filter={filter} consumeAll />
    const options = compileAndTraverse(grammar, 'validValue')

    expect(options).to.eql([{
      text: '',
      words: [{text: 'validValue', input: true}],
      result: 'validValue',
      score: options[0].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      data: []
    }])
    expect(filterSpy).to.have.been.calledOnce
  })

  it('allows splits on strings', () => {
    const grammar = (
      <sequence>
        <freetext splitOn=' ' id='freetext' />
        <choice>
          <literal text=' test' />
          <literal text='thing' />
        </choice>
      </sequence>
    )
    const options = compileAndTraverse(grammar, 'anything goes test')

    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'anything goes', input: true},
        {text: ' test', input: true}
      ],
      result: {freetext: 'anything goes'},
      score: options[0].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      data: []
    }, {
      text: null,
      words: [
        {text: 'anything goes test', input: true},
        {text: ' test', input: false}
      ],
      result: {freetext: 'anything goes test'},
      score: options[1].score,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }, {
      text: null,
      words: [
        {text: 'anything goes test', input: true},
        {text: 'thing', input: false}
      ],
      result: {freetext: 'anything goes test'},
      score: options[2].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      data: []
    }])
  })

  it('allows greedy', () => {
    const grammar = (
      <sequence>
        <freetext splitOn=' ' id='freetext' greedy />
        <literal text=' test' />
      </sequence>
    )
    const options = compileAndTraverse(grammar, 'anything goes test')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'anything goes test', input: true},
        {text: ' test', input: false}
      ],
      result: {freetext: 'anything goes test'},
      score: options[0].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      data: []
    }, {
      text: '',
      words: [
        {text: 'anything goes', input: true},
        {text: ' test', input: true}
      ],
      result: {freetext: 'anything goes'},
      score: options[1].score,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }])
  })

  it('allows splits on regex (with weird parens)', () => {
    const grammar = (
      <sequence>
        <freetext splitOn={/(( )())/} id='freetext' />
        <choice>
          <literal text=' test' />
          <literal text='thing' />
        </choice>
      </sequence>
    )
    const options = compileAndTraverse(grammar, 'anything goes test')

    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'anything goes', input: true},
        {text: ' test', input: true}
      ],
      result: {freetext: 'anything goes'},
      score: options[0].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      data: []
    }, {
      text: null,
      words: [
        {text: 'anything goes test', input: true},
        {text: ' test', input: false}
      ],
      result: {freetext: 'anything goes test'},
      score: options[1].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      data: []
    }, {
      text: null,
      words: [
        {text: 'anything goes test', input: true},
        {text: 'thing', input: false}
      ],
      result: {freetext: 'anything goes test'},
      score: options[2].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations: [],
      data: []
    }])
  })
})
