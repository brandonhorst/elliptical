/** @jsx createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import {createElement, Phrase} from 'lacona-phrase'
import fulltext from 'lacona-util-fulltext'
import reconcile from '../lib/reconcile'

describe('reconcile', () => {
  it('throws for phrases without a default-lang schema', () => {
    class Test extends Phrase {}
    Test.translations = [{
      langs: ['en-US'],
      describe() {
        return <literal text='whatever' />
      }
    }]

    expect(() => reconcile(<Test />)).to.throw(Error)
  })

  it('throws for translations without a lang', () => {
    class Test extends Phrase {}
    Test.translations = [{
      describe () {
        return <literal text='whatever' />
      }
    }]

    expect(() => reconcile(<Test />)).to.throw(Error)
  })

  it('throws for phrases without a describe', () => {
    class Test extends Phrase {}

    expect(() => reconcile(<Test />)).to.throw(Error)
  })
})
