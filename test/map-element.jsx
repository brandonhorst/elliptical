/** @jsx createElement */
/* eslint-env mocha */
import chai, { expect } from 'chai'
import { text } from './_util'
import { Parser } from '..'
import { createElement } from 'lacona-phrase'
import { spy } from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('elements/map', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('maps an element\'s result', () => {
    function addIng (result) {
      return `${result}ing`
    }

    parser.grammar = (
      <map function={addIng}>
        <literal text='test' value='test' />
      </map>
    )

    const data = parser.parseArray('test')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
    expect(data[0].result).to.eql('testing')
  })

  it('maps an element\'s result with an iterator', () => {
    function * addSuffixes (result) {
      yield `${result}ing`
      yield `${result}ed`
    }

    parser.grammar = (
      <map iteratorFunction={addSuffixes}>
        <literal text='test' value='test' />
      </map>
    )

    const data = parser.parseArray('test')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('test')
    expect(data[0].result).to.eql('testing')
    expect(text(data[1])).to.equal('test')
    expect(data[1].result).to.eql('tested')
  })

  it('maps an element\'s result with an iterator, and can be limited', () => {
    function * addSuffixes (result) {
      yield `${result}ing`
      yield `${result}ed`
    }

    parser.grammar = (
      <map iteratorFunction={addSuffixes} limit={1}>
        <literal text='test' value='test' />
      </map>
    )

    const data = parser.parseArray('test')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
    expect(data[0].result).to.eql('testing')
  })

  it('maps an element\'s result, but not if there is a placeholder', () => {
    const mapSpy = spy()
    function addIng (result) {
      mapSpy()
      return `${result}ing`
    }

    parser.grammar = (
      <map function={addIng}>
        <label text='label'>
          <literal text='test' value='test' />
        </label>
      </map>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('label')
    expect(mapSpy).to.not.have.been.called
    expect(data[0].result).to.be.undefined

    const data1 = parser.parseArray('t')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('test')
    expect(mapSpy).to.have.been.calledOnce
    expect(data1[0].result).to.eql('testing')
  })


  it('exports a class', () => {
    class ResultClass {
      constructor (result) {
        this.result = result
      }
    }

    parser.grammar = (
      <map function={result => new ResultClass(result)}>
        <literal text='test' value='test' />
      </map>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('test')
    expect(data1[0].result).to.be.an.instanceof(ResultClass)
    expect(data1[0].result.result).to.equal('test')
  })
})
