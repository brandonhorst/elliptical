/** @jsx createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import {createElement, createPhrase, Phrase} from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('additions', () => {
  let parser
  let Test

  beforeEach(() => {
    Test = createPhrase({
      describe() {
        return <literal text={this.config || 'nothing'} />
      }
    })
    parser = new lacona.Parser()
    parser.sentences = [<Test />]
  })

  it('allows phrases to have additions', () => {
    Test.setAdditions({config: 'test'})

    const data = from(parser.parse(''))

    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('test')
  })

  it('allows initialAdditions', () => {
    Test.initialAdditions = {config: 'test'}

    const data = from(parser.parse(''))

    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('test')
  })

  it('changing additions clears the describe cache', () => {
    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.suggestion(data1[0])).to.equal('nothing')

    Test.setAdditions({config: 'test'})

    const data2 = from(parser.parse(''))
    expect(data2).to.have.length(1)
    expect(fulltext.suggestion(data2[0])).to.equal('test')
  })

  it('can remove additions', () => {
    Test.initialAdditions = {config: 'test'}
    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.suggestion(data1[0])).to.equal('test')

    Test.setAdditions({})

    const data2 = from(parser.parse(''))
    expect(data2).to.have.length(1)
    expect(fulltext.suggestion(data2[0])).to.equal('nothing')
  })

  it('allows extensions to keep their additions', () => {
    class Extender extends Phrase {
      describe() {
        return <literal text={'ext' + this.config} />
      }
    }
    Extender.supplements = [Test]
    Extender.initialAdditions = {config: 'test'}

    parser.extensions = [Extender]

    const data = from(parser.parse('ext'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('exttest')
  })
})
