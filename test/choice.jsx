/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('choice', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('suggests one valid choice', () => {
    parser.sentences = [
      <choice>
        <literal text='right' />
        <literal text='wrong' />
      </choice>
    ]

    const data = from(parser.parse('r'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('right')
    expect(data[0].result).to.be.empty
  })

  it('suggests multiple valid choices', () => {
    parser.sentences = [
      <choice>
        <literal text='right' />
        <literal text='right also' />
      </choice>
    ]

    const data = from(parser.parse('r'))
    expect(data).to.have.length(2)
    expect(fulltext.suggestion(data[0])).to.equal('right')
    expect(data[0].result).to.be.empty
    expect(fulltext.suggestion(data[1])).to.equal('right also')
    expect(data[0].result).to.be.empty
  })

  it('suggests no valid choices', () => {
    parser.sentences = [
      <choice>
        <literal text='wrong' />
        <literal text='wrong also' />
      </choice>
    ]

    const data = from(parser.parse('r'))
    expect(data).to.have.length(0)
  })

  it('adopts the value of the child (even if it has no id)', () => {
    parser.sentences = [
      <choice>
        <literal text='right' value='testValue' />
        <literal text='wrong' />
      </choice>
    ]

    const data = from(parser.parse('r'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('right')
    expect(data[0].result).to.equal('testValue')
  })

  it('adopts the value of the child', () => {
    class Test extends phrase.Phrase {
      describe() {
        return (
          <choice>
            <literal text='right' value='testValue' />
            <literal text='wrong' />
          </choice>
        )
      }
    }

    parser.sentences = [<Test />]

    const data = from(parser.parse('r'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('right')
    expect(data[0].result).to.equal('testValue')
  })

  it('can set a value', () => {
    class Test extends phrase.Phrase {
      describe() {
        return (
          <choice value='override'>
            <literal text='right' value='testValue' />
            <literal text='wrong' />
          </choice>
        )
      }
    }

    parser.sentences = [<Test />]

    const data = from(parser.parse('r'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('right')
    expect(data[0].result).to.equal('override')
  })
})
