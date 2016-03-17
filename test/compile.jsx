/* eslint-env mocha */
/** @jsx createElement */

import createElement from '../src/element'
import compile from '../src/compile'
import chai, {expect} from 'chai'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('compile', () => {
  it('returns a function', () => {
    const Test = {parse () {}}
    const compiled = compile(<Test />)

    expect(compiled).to.be.an.instanceof(Function)
  })

  it('is fine with describe returning nothing', () => {
    const Test = {describe () {}}
    const compiled = compile(<Test />)

    expect(compiled).to.be.an.instanceof(Function)
  })

  it('passes props to describe', () => {
    const Test = {
      describe ({props, children}) {
        expect(props).to.eql({something: 'test'})
        expect(children).to.eql([])
      }
    }
    compile(<Test something='test' />)
  })

  it('passes defaultProps to describe', () => {
    const Test = {
      defaultProps: {something: 'test'},
      describe ({props, children}) {
        expect(props).to.eql({something: 'test', else: 'another'})
        expect(children).to.eql([])
      }
    }
    compile(<Test else='another' />)
  })

  it('calls process with elements', () => {
    const process = spy()

    compile(<literal text='test' />, process)
    expect(process).to.have.been.calledOnce
    expect(process.args[0][0].props).to.eql({text: 'test'})
  })

  it('replaces element with process results', () => {
    const process = (elem) => elem.type === 'literal' ? <Test /> : elem
    const descSpy = spy()
    const Test = {
      describe () {
        descSpy()
        return <raw />
      }
    }

    compile(<literal text='test' />, process)
    expect(descSpy).to.have.been.calledOnce;
  })

  it('flattens children', () => {
    const describeSpy = spy()

    const Test = {
      describe ({children}) {
        expect(children).to.eql([
          {type: 'literal', props: {text: 'a'}, children: []},
          {type: 'literal', props: {text: 'b'}, children: []}
        ])
        describeSpy()
        return children[0]
      }
    }

    compile(<Test>{[<literal text='a' />, [<literal text='b' />]]}</Test>)
    expect(describeSpy).to.have.been.calledOnce
  })
})
