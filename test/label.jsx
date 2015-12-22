/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('label', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('suppresses with a literal', () => {
    parser.grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <label text='test' id='place'>
          <literal text='literal' value='test' />
        </label>
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('a test')
    expect(data1[0].words[1].placeholder).to.be.true
    expect(data1[0].words[1].argument).to.equal('test')
    expect(data1[0].result).to.eql({a: 'a'})

    const data2 = parser.parseArray('a')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('a test')
    expect(data2[0].words[2].placeholder).to.be.true
    expect(data2[0].words[2].argument).to.equal('test')
    expect(data2[0].result).to.eql({a: 'a'})

    const data3 = parser.parseArray('a ')
    expect(data3).to.have.length(1)
    expect(text(data3[0])).to.equal('a literal')
    expect(data3[0].result).to.eql({a: 'a', place: 'test'})
    expect(data3[0].words[1].placeholder).to.be.undefined
    expect(data3[0].words[1].argument).to.equal('test')

    const data4 = parser.parseArray('a l')
    expect(data4).to.have.length(1)
    expect(text(data4[0])).to.equal('a literal')
    expect(data4[0].result).to.eql({a: 'a', place: 'test'})
    expect(data4[0].words[1].placeholder).to.be.undefined
    expect(data4[0].words[1].argument).to.equal('test')

    const data5 = parser.parseArray('a t')
    expect(data5).to.have.length(0)
  })

  it('suppresses with a value', () => {
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
        <label text='test' id='place'>
          <value compute={func} />
        </label>
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('a test')
    expect(data1[0].result).to.eql({a: 'a'})
    expect(data1[0].words[1].placeholder).to.be.true
    expect(data1[0].words[1].argument).to.equal('test')

    const data2 = parser.parseArray('a')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('a test')
    expect(data2[0].result).to.eql({a: 'a'})
    expect(data2[0].words[2].placeholder).to.be.true
    expect(data2[0].words[2].argument).to.equal('test')

    const data3 = parser.parseArray('a ')
    expect(data3).to.have.length(1)
    expect(text(data3[0])).to.equal('a test')
    expect(data3[0].result).to.eql({a: 'a'})
    expect(data3[0].words[1].placeholder).to.be.true
    expect(data3[0].words[1].argument).to.equal('test')

    const data4 = parser.parseArray('a v')
    expect(data4).to.have.length(1)
    expect(text(data4[0])).to.equal('a value')
    expect(data4[0].result).to.eql({a: 'a', place: 'test'})
    expect(data4[0].words[1].placeholder).to.be.undefined
    expect(data4[0].words[1].argument).to.equal('test')

    const data5 = parser.parseArray('a t')
    expect(data5).to.have.length(0)
  })

  it('exports an argument', () => {
    parser.grammar = (
      <sequence>
        <literal text='a' />
        <label text='arg'>
          <sequence>
            <literal text='b' />
            <literal text='c' />
          </sequence>
        </label>
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
