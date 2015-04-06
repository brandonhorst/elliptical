/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('limit', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  describe('value', () => {
    it('limits suggestions', () => {
      function suggest() {
        return [{suggestion: 'testa'}, {suggestion: 'testb'}, {suggestion: 'testc'}]
      }

      parser.sentences = [<value limit={2} suggest={suggest} />]

      const data = from(parser.parse(''))
      expect(data).to.have.length(2)
      expect(fulltext.all(data[0])).to.equal('testa')
      expect(fulltext.all(data[1])).to.equal('testb')
    })

    it('accepts fewer than limit suggestions', () => {
      function suggest() {
        return [{suggestion: 'testa'}, {suggestion: 'testb'}]
      }

      parser.sentences = [<value limit={3} suggest={suggest} />]

      const data = from(parser.parse(''))
      expect(data).to.have.length(2)
      expect(fulltext.all(data[0])).to.equal('testa')
      expect(fulltext.all(data[1])).to.equal('testb')
    })

    it('limits computations', () => {
      function compute(input) {
        return [
          {words: [{text: 'testa', input: true}], remaining: ''},
          {words: [{text: 'testb', input: true}], remaining: ''},
          {words: [{text: 'testc', input: true}], remaining: ''}
        ]
      }

      parser.sentences = [<value limit={2} compute={compute} />]

      const data = from(parser.parse('test'))
      expect(data).to.have.length(2)
      expect(fulltext.all(data[0])).to.equal('testa')
      expect(fulltext.all(data[1])).to.equal('testb')
    })

    it('accepts fewer than limit suggestions', () => {
      function compute() {
        return [
          {words: [{text: 'testa', input: true}], remaining: ''},
          {words: [{text: 'testb', input: true}], remaining: ''}
        ]
      }

      parser.sentences = [<value limit={3} compute={compute} />]

      const data = from(parser.parse('test'))
      expect(data).to.have.length(2)
      expect(fulltext.all(data[0])).to.equal('testa')
      expect(fulltext.all(data[1])).to.equal('testb')
    })
  })

  describe('choice', () => {
    it('can be restricted by a limit of 1', () => {
      parser.sentences = [
        <choice limit={1}>
          <literal text='right' value='testValue' />
          <literal text='right also' value='also' />
        </choice>
      ]

      const data = from(parser.parse('r'))
      expect(data).to.have.length(1)
      expect(fulltext.suggestion(data[0])).to.equal('right')
      expect(data[0].result).to.equal('testValue')
    })

    it('can be restricted by a limit of more than 1', () => {
      parser.sentences = [
        <choice limit={2}>
          <literal text='right' />
          <literal text='right also' />
          <literal text='right but excluded' />
        </choice>
      ]

      const data = from(parser.parse('r'))
      expect(data).to.have.length(2)
      expect(fulltext.suggestion(data[0])).to.equal('right')
      expect(fulltext.suggestion(data[1])).to.equal('right also')
    })

    it('still works when a limited child has multiple options', () => {
      parser.sentences = [
        <choice limit={2}>
          <choice>
            <literal text='right' />
            <literal text='right also' />
          </choice>
          <literal text='wrong' />
          <literal text='right third' />
        </choice>
      ]

      const data = from(parser.parse('r'))
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[0])).to.equal('right')
      expect(fulltext.suggestion(data[1])).to.equal('right also')
      expect(fulltext.suggestion(data[2])).to.equal('right third')
    })

    it('allows choices in sequences to be limited', () => {
      parser.sentences = [
        <sequence>
          <choice limit={2}>
            <literal text='testa' />
            <literal text='x' />
            <literal text='testb' />
            <literal text='testc' />
          </choice>
          <literal text='also' />
        </sequence>
      ]

      const data = from(parser.parse('test'))
      expect(data).to.have.length(2)
      expect(fulltext.suggestion(data[0])).to.equal('testa')
      expect(fulltext.completion(data[0])).to.equal('also')
      expect(fulltext.suggestion(data[1])).to.equal('testb')
      expect(fulltext.completion(data[1])).to.equal('also')
    })

    it('limits even if valid parses do not parse to completion', () => {
      parser.sentences = [
        <sequence>
          <choice limit={1}>
            <literal text='righ' />
            <literal text='right' />
            <literal text='righta' />
          </choice>
          <literal text='also' />
        </sequence>
      ]

      const data = from(parser.parse('righta'))
      expect(data).to.have.length(1)
      expect(fulltext.match(data[0])).to.equal('right')
      expect(fulltext.suggestion(data[0])).to.equal('also')
    })
  })
})
