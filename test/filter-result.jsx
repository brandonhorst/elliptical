/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'
import {spy} from 'sinon'
import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)


describe('filterResult', () => {
  it('rejects a result', () => {
    const filterSpy = spy()
    const FakeTest = {}

    const Test = {
      filterResult (result, {props, children}) {
        expect(result).to.equal('test')
        expect(props).to.eql({prop: 'test'})
        expect(children).to.eql([{type: FakeTest, props: {}, children: []}])
        filterSpy()

        return false
      },

      describe () {
        return <literal text='test' value='test' />
      }
    }
    const options = compileAndTraverse(<Test prop='test'><FakeTest /></Test>)

    expect(options).to.eql([])
    expect(filterSpy).to.have.been.calledOnce
  })
})