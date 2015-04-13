/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('placeholder', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('handles a placeholder (literal)', () => {
    parser.grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <placeholder text='test' id='place'>
          <literal text='literal' value='test' />
        </placeholder>
      </sequence>
    )

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(data1[0].result).to.eql({a: 'a'})
    expect(fulltext.all(data1[0])).to.equal('a test')

    const data2 = from(parser.parse('a'))
    expect(data2).to.have.length(1)
    expect(data2[0].result).to.eql({a: 'a'})
    expect(fulltext.all(data2[0])).to.equal('a test')

    const data3 = from(parser.parse('a '))
    expect(data3).to.have.length(1)
    expect(data3[0].result).to.eql({a: 'a', place: 'test'})
    expect(fulltext.all(data3[0])).to.equal('a literal')

    const data4 = from(parser.parse('a l'))
    expect(data4).to.have.length(1)
    expect(data4[0].result).to.eql({a: 'a', place: 'test'})
    expect(fulltext.all(data4[0])).to.equal('a literal')

    const data5 = from(parser.parse('a t'))
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

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(data1[0].result).to.eql({a: 'a'})
    expect(fulltext.all(data1[0])).to.equal('a test')

    const data2 = from(parser.parse('a'))
    expect(data2).to.have.length(1)
    expect(data2[0].result).to.eql({a: 'a'})
    expect(fulltext.all(data2[0])).to.equal('a test')

    const data3 = from(parser.parse('a '))
    expect(data3).to.have.length(1)
    expect(data3[0].result).to.eql({a: 'a'})
    expect(fulltext.all(data3[0])).to.equal('a test')

    const data4 = from(parser.parse('a v'))
    expect(data4).to.have.length(1)
    expect(data4[0].result).to.eql({a: 'a', place: 'test'})
    expect(fulltext.all(data4[0])).to.equal('a value')

    const data5 = from(parser.parse('a t'))
    expect(data5).to.have.length(0)
  })
})
