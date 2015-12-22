/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('limit', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  describe('value', () => {
    it('limits computations', () => {
      function compute(input) {
        return [
          {words: [{text: 'testa', input: true}], remaining: ''},
          {words: [{text: 'testb', input: true}], remaining: ''},
          {words: [{text: 'testc', input: true}], remaining: ''}
        ]
      }

      parser.grammar = <raw limit={2} function={compute} />

      const data = parser.parseArray('t')
      expect(data).to.have.length(2)
      expect(text(data[0])).to.equal('testa')
      expect(text(data[1])).to.equal('testb')
    })

    it('accepts fewer than limit computations', () => {
      function compute() {
        return [
          {words: [{text: 'testa', input: true}], remaining: ''},
          {words: [{text: 'testb', input: true}], remaining: ''}
        ]
      }

      parser.grammar = <raw limit={3} function={compute} />

      const data = parser.parseArray('t')
      expect(data).to.have.length(2)
      expect(text(data[0])).to.equal('testa')
      expect(text(data[1])).to.equal('testb')
    })
  })

  describe('choice', () => {
    it('can be restricted by a limit of 1', () => {
      parser.grammar = (
        <choice limit={1}>
          <literal text='right' value='testValue' />
          <literal text='right also' value='also' />
        </choice>
      )

      const data = parser.parseArray('')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('right')
      expect(data[0].result).to.equal('testValue')
    })

    it('can be restricted by a limit of more than 1', () => {
      parser.grammar = (
        <choice limit={2}>
          <literal text='right' />
          <literal text='right also' />
          <literal text='right but excluded' />
        </choice>
      )

      const data = parser.parseArray('')
      expect(data).to.have.length(2)
      expect(text(data[0])).to.equal('right')
      expect(text(data[1])).to.equal('right also')
    })

    it('still works when a limited child has multiple options', () => {
      parser.grammar = (
        <choice limit={2}>
          <choice>
            <literal text='right' />
            <literal text='right also' />
          </choice>
          <literal text='wrong' />
          <literal text='right third' />
        </choice>
      )

      const data = parser.parseArray('ri')
      expect(data).to.have.length(3)
      expect(text(data[0])).to.equal('right')
      expect(text(data[1])).to.equal('right also')
      expect(text(data[2])).to.equal('right third')
    })

    it('allows choices in sequences to be limited', () => {
      parser.grammar = (
        <sequence>
          <choice limit={2}>
            <literal text='testa' />
            <literal text='x' />
            <literal text='testb' />
            <literal text='testc' />
          </choice>
          <literal text='also' />
        </sequence>
      )

      const data = parser.parseArray('test')
      expect(data).to.have.length(2)
      expect(text(data[0])).to.equal('testaalso')
      expect(text(data[1])).to.equal('testbalso')
    })

    it('limits even if valid parses do not parse to completion', () => {
      parser.grammar = (
        <sequence>
          <choice limit={1}>
            <literal text='righ' />
            <literal text='right' />
            <literal text='righta' />
          </choice>
          <literal text='also' />
        </sequence>
      )

      const data = parser.parseArray('righta')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('rightalso')
    })
  })
})
