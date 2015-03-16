/** @jsx createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import {createElement, createPhrase, Phrase} from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('prototype', () => {
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

  it('allows phrases to have custom prototypes', () => {
    Test.prototype.config = 'test'

    const data = from(parser.parse(''))

    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('test')
  })

  it('unchanged prototype persists', () => {
    Test.prototype.config = 'test'

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.suggestion(data1[0])).to.equal('test')

    const data2 = from(parser.parse(''))
    expect(data2).to.have.length(1)
    expect(fulltext.suggestion(data2[0])).to.equal('test')
  })

  it('changing prototype forces a redescribe', () => {
    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.suggestion(data1[0])).to.equal('nothing')

    Test.prototype.config = 'test'

    const data2 = from(parser.parse(''))
    expect(data2).to.have.length(1)
    expect(fulltext.suggestion(data2[0])).to.equal('test')
  })

  it('removing prototype forces a redescribe', () => {
    Test.prototype.config = 'test'

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.suggestion(data1[0])).to.equal('test')

    delete Test.prototype.config

    const data2 = from(parser.parse(''))
    expect(data2).to.have.length(1)
    expect(fulltext.suggestion(data2[0])).to.equal('nothing')
  })

  it('allows extensions to have modified prototypes', () => {
    class Extender extends Phrase {
      describe() {
        return <literal text={'ext' + this.config} />
      }
    }
    Extender.supplements = [Test]
    Extender.prototype.config = 'test'

    parser.extensions = [Extender]

    const data = from(parser.parse('ext'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('exttest')
  })
})
