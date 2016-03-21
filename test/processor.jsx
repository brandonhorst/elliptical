/* eslint-env mocha */
/** @jsx createElement */

import _ from 'lodash'
import createElement from '../src/element'
import compile from '../src/compile'
import combineProcessors from '../src/combine'
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'
import {spy} from 'sinon'

chai.use(sinonChai)

describe('combineProcessors', () => {
  it('combines preprocessors', () => {
    const Test = {}
    function process1 (element) {
      expect(element).to.eql({
        type: Test,
        props: {},
        children: []
      })
      return _.assign({}, element, {first: 1})
    }
    function process2 (element) {
      expect(element).to.eql({
        type: Test,
        props: {},
        children: [],
        first: 1
      })
      return _.assign({}, element, {second: 2})
    }
    const processor = combineProcessors(process1, process2)
    const finalElement = processor(<Test />)
    expect(finalElement).to.eql({
      type: Test,
      props: {},
      children: [],
      first: 1,
      second: 2
    })
  })

  it('is fine if a processor returns null', () => {
    const process2Spy = spy()
    const Test = {}
    function process1 (element) {
      return null
    }
    function process2 (element) {
      process2Spy()
      return null
    }
    const processor = combineProcessors(process1, process2)
    const finalElement = processor(<Test />)
    expect(finalElement).to.be.undefined
    expect(process2Spy).to.not.have.been.called
  })
})
