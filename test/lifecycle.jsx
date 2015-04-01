/** @jsx createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import {createElement, Phrase, Source} from 'lacona-phrase'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)
chai.config.includeStack = true

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('lifecycle', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('calls create on creation and destroy on removal', () => {
    const createSpy = spy()
    const destSpy = spy()

    class Test extends Phrase {
      create() {createSpy()}
      destroy() {destSpy()}
      describe() {return <literal text='test' />}
    }

    parser.sentences = [<Test />]

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.all(data1[0])).to.equal('test')
    expect(createSpy).to.have.been.calledOnce
    expect(destSpy).to.not.have.been.called

    parser.sentences = []

    const data2 = from(parser.parse(''))
    expect(data2).to.have.length(0)
    expect(createSpy).to.have.been.calledOnce
    expect(destSpy).to.have.been.calledOnce
  })

  it('calls create and destroy on Sources', () => {
    const createSpy = spy()
    const destSpy = spy()

    class TestSource extends Source {
      create() {createSpy()}
      destroy() {destSpy()}
    }

    class Test extends Phrase {
      source() {return {data: <TestSource />}}
      describe() {return <literal text='test' />}
    }


    parser.sentences = [<Test />]

    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.all(data1[0])).to.equal('test')
    expect(createSpy).to.have.been.calledOnce
    expect(destSpy).to.not.have.been.called

    parser.sentences = []

    const data2 = from(parser.parse(''))
    expect(data2).to.have.length(0)
    expect(createSpy).to.have.been.calledOnce
    expect(destSpy).to.have.been.calledOnce
  })
})
