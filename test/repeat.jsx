/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('repeat', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('does not accept input that does not match the child', () => {
    parser.sentences = [
      <repeat>
        <content><literal text='super' /></content>
        <separator><literal text='man' /></separator>
      </repeat>
    ]

    const data = from(parser.parse('wrong'))
    expect(data).to.have.length(0)
  })

  it('accepts the child on its own', () => {
    parser.sentences = [
      <repeat>
        <content><literal text='super' /></content>
        <separator><literal text='man' /></separator>
      </repeat>
    ]

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('man')
  })

  it('accepts the child twice, with the separator in the middle', () => {
    parser.sentences = [
      <repeat>
        <content><literal text='super' /></content>
        <separator><literal text='man' /></separator>
      </repeat>
    ]

    const data = from(parser.parse('supermans'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('super')
  })

  it('does not accept input that does not match the child (no separator)', () => {
    parser.sentences = [
      <repeat>
        <literal text='super' />
      </repeat>
    ]
    const data = from(parser.parse('wrong'))
    expect(data).to.have.length(0)
  })

  it('accepts the child on its own', () => {
    parser.sentences = [
      <repeat>
        <literal text='super' />
      </repeat>
    ]

    const data = from(parser.parse('sup'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('super')
  })

  it('accepts the child twice', () => {
    parser.sentences = [
      <repeat>
        <literal text='super' />
      </repeat>
    ]

    const data = from(parser.parse('supers'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('super')
    expect(fulltext.match(data[0])).to.equal('super')
  })

  it('creates an array from the values of the children', () => {
    parser.sentences = [
      <repeat>
        <literal text='super' value='testValue' id='subElementId' />
      </repeat>
    ]

    const data = from(parser.parse('supers'))
    expect(data).to.have.length(1)
    expect(data[0].result).to.deep.equal(['testValue', 'testValue'])
    expect(data[0].result.subElementId).to.be.undefined
  })

  it('does not pass on child values to phrases', () => {
    class Test extends phrase.Phrase {
      describe() {
        return (
          <repeat id='testId'>
            <literal text='super' value='testValue' id='subElementId' />
          </repeat>
        )
      }
    }

    parser.sentences = [<Test />]

    const data = from(parser.parse('supers'))
    expect(data).to.have.length(1)
    expect(data[0].result.testId).to.deep.equal(['testValue', 'testValue'])
    expect(data[0].result.subElementId).to.be.undefined
  })

  it('does not accept fewer than min iterations', () => {
    parser.sentences = [
      <repeat min={2}>
        <content><literal text='a' /></content>
        <separator><literal text='b' /></separator>
      </repeat>
    ]

    const data = from(parser.parse('a'))
    expect(data).to.have.length(1)
    expect(fulltext.match(data[0])).to.equal('a')
    expect(fulltext.suggestion(data[0])).to.equal('b')
    expect(fulltext.completion(data[0])).to.equal('a')
  })

  it('does not accept more than max iterations', () => {
    parser.sentences = [
      <repeat max={1}>
        <content><literal text='a' /></content>
        <separator><literal text='b' /></separator>
      </repeat>
    ]

    const data = from(parser.parse('a'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('')
    expect(fulltext.match(data[0])).to.equal('a')
  })

  it('passes on its category', () => {
    parser.sentences = [
      <repeat category='myCat'>
        <literal text='a' />
      </repeat>
    ]

    const data = from(parser.parse('a'))
    expect(data).to.have.length(2)
    expect(data[0].match[0].category).to.equal('myCat')
    expect(data[1].match[0].category).to.equal('myCat')
  })

  it('rejects non-unique repeated elements', () => {
    parser.sentences = [
      <repeat unique={true}>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </repeat>
    ]

    const data = from(parser.parse('aa'))
    expect(data).to.have.length(0)
  })

  it('accepts unique repeated elements', () => {
    parser.sentences = [
      <repeat unique={true}>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </repeat>
    ]

    const data = from(parser.parse('ab'))
    expect(data).to.have.length(1)
    expect(fulltext.match(data[0])).to.equal('ab')
  })
})
