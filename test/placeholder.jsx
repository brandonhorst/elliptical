/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

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
        <placeholder descriptor='test' id='place'>
          <literal text='literal' value='test' />
        </placeholder>
      </sequence>
    )

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(data1[0].result).to.eql({a: 'a'})
    expect(data1[0].completion[0].descriptors[0]).to.equal('test')

    const data2 = from(parser.parse('a'))
    expect(data2).to.have.length(1)
    expect(data2[0].result).to.eql({a: 'a'})
    expect(data2[0].completion[0].descriptors[0]).to.equal('test')

    const data3 = from(parser.parse('a '))
    expect(data3).to.have.length(1)
    expect(data3[0].result).to.eql({a: 'a', place: 'test'})
    expect(fulltext.all(data3[0])).to.equal('a literal')
    expect(data3[0].suggestion[0].descriptors[0]).to.equal('test')

    const data4 = from(parser.parse('a l'))
    expect(data4).to.have.length(1)
    expect(data4[0].result).to.eql({a: 'a', place: 'test'})
    expect(fulltext.all(data4[0])).to.equal('a literal')
    expect(data4[0].suggestion[0].descriptors[0]).to.equal('test')

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
        <placeholder descriptor='test' id='place'>
          <value compute={func} />
        </placeholder>
      </sequence>
    )

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(data1[0].result).to.eql({a: 'a'})
    expect(data1[0].completion[0].descriptors[0]).to.equal('test')

    const data2 = from(parser.parse('a'))
    expect(data2).to.have.length(1)
    expect(data2[0].result).to.eql({a: 'a'})
    expect(data2[0].completion[0].descriptors[0]).to.equal('test')

    const data3 = from(parser.parse('a '))
    expect(data3).to.have.length(1)
    expect(data3[0].result).to.eql({a: 'a'})
    expect(data3[0].suggestion[0].descriptors[0]).to.equal('test')

    const data4 = from(parser.parse('a v'))
    expect(data4).to.have.length(1)
    expect(data4[0].result).to.eql({a: 'a', place: 'test'})
    expect(data4[0].match[1].string).to.equal('value')

    const data5 = from(parser.parse('a t'))
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

    const data1 = from(parser.parse(''))
    expect(func).to.not.have.been.called
    expect(data1).to.have.length(1)

    const data2 = from(parser.parse('a '))
    expect(func).to.have.been.calledOnce
    expect(data2).to.have.length(1)

    const data3 = from(parser.parse('a l'))
    expect(func).to.have.been.calledTwice
    expect(data3).to.have.length(1)
  })

  it('can utilize showForEmpty', () => {
    parser.grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <placeholder descriptor='test' showForEmpty={true} id='place'>
          <literal text='literal' />
        </placeholder>
      </sequence>
    )

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(data1[0].completion[0].descriptors[0]).to.equal('test')

    const data2 = from(parser.parse('a'))
    expect(data2).to.have.length(1)
    expect(data2[0].completion[0].descriptors[0]).to.equal('test')

    const data3 = from(parser.parse('a '))
    expect(data3).to.have.length(1)
    expect(data3[0].suggestion[0].descriptors[0]).to.equal('test')

    const data4 = from(parser.parse('a l'))
    expect(data4).to.have.length(1)
    expect(fulltext.suggestion(data4[0])).to.equal('literal')
  })

  it('can utilize displayWhen', () => {
    function displayWhen (input) {
      return !input.includes(' ')
    }

    parser.grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <placeholder descriptor='test' displayWhen={displayWhen} id='place'>
          <literal text='literal' />
        </placeholder>
      </sequence>
    )

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(data1[0].completion[0].descriptors[0]).to.equal('test')

    const data2 = from(parser.parse('a test'))
    expect(data2).to.have.length(1)
    expect(data2[0].suggestion[0].descriptors[0]).to.equal('test')

    const data3 = from(parser.parse('a test test'))
    expect(data3).to.have.length(0)
  })
})
