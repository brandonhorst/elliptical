/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {text, compileAndTraverse} from './_util'
import {spy} from 'sinon'
import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('augment', () => {
  it('modifies a result', () => {
    const mapSpy = spy()
    const FakeTest = {}

    const Test = {
      mapResult (result, {props, children}) {
        expect(result).to.equal('test')
        expect(props).to.eql({prop: 'test'})
        expect(children).to.eql([{type: FakeTest, props: {}, children: []}])
        mapSpy()

        return 3
      },

      describe () {
        return <literal text='test' value='test' />
      }
    }
    const options = compileAndTraverse(<Test prop='test'><FakeTest /></Test>)

    expect(options).to.have.length(1)
    expect(options[0].result).to.equal(3)
    expect(text(options[0])).to.equal('test')
    expect(mapSpy).to.have.been.calledOnce
  })
})