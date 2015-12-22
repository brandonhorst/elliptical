/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('tap', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('calls function when entered', () => {
    const func = spy()

    parser.grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <tap function={func}>
          <literal text='literal' />
        </tap>
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(func).to.not.have.been.called
    expect(data1).to.have.length(1)

    const data2 = parser.parseArray('a ')
    expect(func).to.have.been.calledOnce
    expect(func).to.have.been.calledWith('')
    expect(data2).to.have.length(1)

    const data3 = parser.parseArray('a l')
    expect(func).to.have.been.calledTwice
    expect(func).to.have.been.calledWith('l')
    expect(data3).to.have.length(1)
  })
})
