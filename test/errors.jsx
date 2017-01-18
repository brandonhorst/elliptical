/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'

import {stub} from 'sinon'
import { expect } from 'chai'

describe('errors = "log"', () => {
  let consoleStub

  beforeEach(() => {
    stub(console, 'error')
  })

  afterEach(() => {
    console.error.restore()
  })

  it('handles errors in describe', () => {
    const ErrorPhrase = {
      describe () {
        throw new Error('Purposeful')
      }
    }
    const options = compileAndTraverse(
      <ErrorPhrase />
    , '', {errors: 'log'})

    expect(options).to.eql([])
    expect(console.error).to.have.been.calledOnce
  })

  it('handles errors in visit', () => {
    const ErrorPhrase = {
      visit () {
        throw new Error('Purposeful')
      }
    }
    const options = compileAndTraverse(
      <ErrorPhrase />
    , '', {errors: 'log'})

    expect(options).to.eql([])
    expect(console.error).to.have.been.calledOnce
  })

  it('handles errors in mapResult', () => {
    const ErrorPhrase = {
      mapResult () {
        throw new Error('Purposeful')
      },
      describe () {
        return <literal text='test' value='test' />
      }
    }
    const options = compileAndTraverse(
      <ErrorPhrase />
    , '', {errors: 'log'})

    expect(options).to.eql([{
      annotations: [],
      arguments: [],
      categories: [],
      qualifiers: [],
      result: "test",
      score: 1,
      text: null,
      words: [{"input": false, "text": "test"}],
      data: []
    }])
    expect(console.error).to.have.been.calledOnce
  })

  it('handles errors in filterResult', () => {
    const ErrorPhrase = {
      filterResult () {
        throw new Error('Purposeful')
      },
      describe () {
        return <literal text='test' value='test' />
      }
    }
    const options = compileAndTraverse(
      <ErrorPhrase />
    , '', {errors: 'log'})

    expect(options).to.eql([{
      annotations: [],
      arguments: [],
      categories: [],
      qualifiers: [],
      result: "test",
      score: 1,
      text: null,
      words: [{"input": false, "text": "test"}],
      data: []
    }])
    
    expect(console.error).to.have.been.calledOnce
  })
})