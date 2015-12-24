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

  it('maps an element\'s result', () => {
    const mapSpy = spy()
    function addIng (result) {
      mapSpy()
      return `${result}ing`
    }

    parser.grammar = (
      <map function={addIng}>
        <label text='label' suppressEmpty>
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
})
