/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('literal', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('handles a literal', () => {
    parser.grammar = <literal text='literal test' />
    const data = parser.parseArray('')

    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('literal test')
    expect(data[0].result).to.be.empty
  })

  it('handles a literal with a value', () => {
    parser.grammar = <literal text='literal test' value='test'/>
    const data = parser.parseArray('')

    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('literal test')
    expect(data[0].result).to.equal('test')
  })

  it('maintains case', () => {
    parser.grammar = <literal text='Test' />
    const data = parser.parseArray('test')

    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('Test')
  })

  describe('decorate', () => {
    it('suggests a decoration', () => {
      parser.grammar = (
        <sequence>
          <literal text='a' />
          <literal text='b' decorate />
        </sequence>
      )

      const data = parser.parseArray('a')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('ab')
    })

    it('decorates an input', () => {
      parser.grammar = (
        <sequence>
          <literal text='b' decorate />
          <literal text='a' />
        </sequence>
      )

      const data = parser.parseArray('a')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('ba')
    })

    it('decorates an freetext', () => {
      parser.grammar = (
        <sequence>
          <literal text='x ' decorate />
          <freetext id='test' />
        </sequence>
      )

      const data = parser.parseArray('x superman')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('x superman')
      expect(data[0].result.test).to.equal('superman')
    })

    it('decorates an placeholder', () => {
      parser.grammar = (
        <sequence>
          <literal text='s' />
          <literal text='x ' decorate />
          <label text='test' id='test'>
            <freetext />
          </label>
        </sequence>
      )

      const data = parser.parseArray('ssuperman')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('sx superman')
      expect(data[0].result.test).to.equal('superman')
    })
  })
})
