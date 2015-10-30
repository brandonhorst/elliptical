/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('descriptor', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  describe('placeholder', () => {
    it('handles a placeholder (literal)', () => {
      parser.grammar = (
        <sequence>
          <literal text='a ' id='a' value='a' />
          <placeholder text='test' id='place'>
            <literal text='literal' value='test' />
          </placeholder>
        </sequence>
      )

      const data1 = parser.parseArray('')
      expect(data1).to.have.length(1)
      expect(text(data1[0])).to.equal('a test')
      expect(data1[0].words[1].placeholder).to.be.true
      expect(data1[0].result).to.eql({a: 'a'})

      const data2 = parser.parseArray('a')
      expect(data2).to.have.length(1)
      expect(text(data2[0])).to.equal('a test')
      expect(data2[0].words[2].placeholder).to.be.true
      expect(data2[0].result).to.eql({a: 'a'})

      const data3 = parser.parseArray('a ')
      expect(data3).to.have.length(1)
      expect(text(data3[0])).to.equal('a literal')
      expect(data3[0].result).to.eql({a: 'a', place: 'test'})
      expect(data3[0].words[1].placeholder).to.not.be.true

      const data4 = parser.parseArray('a l')
      expect(data4).to.have.length(1)
      expect(text(data4[0])).to.equal('a literal')
      expect(data4[0].result).to.eql({a: 'a', place: 'test'})
      expect(data4[0].words[1].placeholder).to.not.be.true

      const data5 = parser.parseArray('a t')
      expect(data5).to.have.length(0)
    })

    it('handles a placeholder (value)', () => {
      function func(input) {
        if (input === 'v') {
          return [{
            words: [{text: 'value', input: true}],
            remaining: '',
            value: 'test'
          }]
        } else {
          return []
        }
      }

      parser.grammar = (
        <sequence>
          <literal text='a ' id='a' value='a' />
          <placeholder text='test' id='place'>
            <value compute={func} />
          </placeholder>
        </sequence>
      )

      const data1 = parser.parseArray('')
      expect(data1).to.have.length(1)
      expect(text(data1[0])).to.equal('a test')
      expect(data1[0].result).to.eql({a: 'a'})

      const data2 = parser.parseArray('a')
      expect(data2).to.have.length(1)
      expect(text(data2[0])).to.equal('a test')
      expect(data2[0].result).to.eql({a: 'a'})

      const data3 = parser.parseArray('a ')
      expect(data3).to.have.length(1)
      expect(text(data3[0])).to.equal('a test')
      expect(data3[0].result).to.eql({a: 'a'})

      const data4 = parser.parseArray('a v')
      expect(data4).to.have.length(1)
      expect(text(data4[0])).to.equal('a value')
      expect(data4[0].result).to.eql({a: 'a', place: 'test'})

      const data5 = parser.parseArray('a t')
      expect(data5).to.have.length(0)
    })

    it('calls trigger when entered', () => {
      const func = spy()

      parser.grammar = (
        <sequence>
          <literal text='a ' id='a' value='a' />
          <placeholder descriptor='test' trigger={func} id='place'>
            <literal text='literal' />
          </placeholder>
        </sequence>
      )

      const data1 = parser.parseArray('')
      expect(func).to.not.have.been.called
      expect(data1).to.have.length(1)

      const data2 = parser.parseArray('a ')
      expect(func).to.have.been.calledOnce
      expect(func).to.have.been.calledWith('')
      expect(data2).to.have.length(1)

      const data3 = parser.parseArray('a l')
      expect(func).to.have.been.calledTwice
      expect(func).to.have.been.calledWith('l')
      expect(data3).to.have.length(1)
    })

    it('does not call trigger for reparses', () => {
      const func = spy()

      parser.grammar = (
        <sequence>
          <literal text='a ' id='a' value='a' />
          <placeholder descriptor='test' trigger={func} id='place'>
            <literal text='literal' />
          </placeholder>
        </sequence>
      )

      const data2 = parser.parseArray('a ')
      expect(func).to.have.been.calledOnce
      expect(func).to.have.been.calledWith('')
      expect(data2).to.have.length(1)

      const data3 = parser.parseArray('a ', true)
      expect(func).to.have.been.calledOnce
      expect(data3).to.have.length(1)
    })
  })

  describe('argument', () => {
    it('exports an argument', () => {
      parser.grammar = (
        <sequence>
          <literal text='a' />
          <argument text='arg'>
            <sequence>
              <literal text='b' />
              <literal text='c' />
            </sequence>
          </argument>
          <literal text='d' />
        </sequence>
      )

      const data = parser.parseArray('abcd')
      expect(data).to.have.length(1)
      expect(data[0].words).to.have.length(4)
      expect(data[0].words[0].argument).to.not.be.true
      expect(data[0].words[1].argument).to.equal('arg')
      expect(data[0].words[2].argument).to.equal('arg')
      expect(data[0].words[3].argument).to.not.be.true
    })
  })
})
