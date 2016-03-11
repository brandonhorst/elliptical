/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'
import {spy} from 'sinon'
import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)


describe('validate', () => {
  it('rejects a result', () => {
    const validateSpy = spy()
    const FakeTest = {}

    const Test = {
      validate (result, {props, children, data}) {
        expect(result).to.equal('test')
        expect(props).to.eql({prop: 'test'})
        expect(children).to.eql([{type: FakeTest, props: {}, children: []}])
        expect(data).to.be.undefined
        validateSpy()

        return false
      },

      describe () {
        return <literal text='test' value='test' />
      }
    }
    const options = compileAndTraverse(<Test prop='test'><FakeTest /></Test>)

    expect(options).to.eql([])
    expect(validateSpy).to.have.been.calledOnce
  })
})