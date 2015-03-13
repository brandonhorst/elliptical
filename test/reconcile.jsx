/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'
import reconcile from '../lib/reconcile'

describe('reconcile', () => {
  it('throws for phrases without a default-lang schema', () => {
    class Test extends phrase.Phrase {
      getTranslations() {
        return [{
          langs: ['en-US'],
          describe: () => {
            return lacona.literal({text: 'whatever'})
          }
        }]
      }
    }

    expect(() => reconcile(<Test />)).to.throw(Error)
  })

  it('throws for translations without a lang', () => {
    class Test extends phrase.Phrase {
      getTranslations() {
        return [{
          describe: () => {
            return lacona.literal({text: 'whatever'})
          }
        }]
      }
    }

    expect(() => reconcile(<Test />)).to.throw(Error)
  })

  it('throws for phrases without a describe', () => {
    class Test extends phrase.Phrase {}

    expect(() => reconcile(<Test />)).to.throw(Error)
  })
})
