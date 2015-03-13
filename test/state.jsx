/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('state', () => {
  let parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('allows for initialState', () => {
    class Test extends phrase.Phrase {
      static get initialState() {return {test: 'testa'}}
      describe() {return <literal text={this.state.test} />}
    }

    parser.sentences = [<Test />]

    const data = from(parser.parse(''))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('testa')
  })

  it('allows Phrases to call setState', () => {
    class Test extends phrase.Phrase {
      static get initialState() { return {test: 'testa'} }
      describe() {
        this.setState({test: 'testb'})
        return <literal text={this.state.test} />
      }
    }

    parser.sentences = [<Test />]

    const data1 = from(parser.parse('test'))
    expect(fulltext.all(data1[0])).to.equal('testa')

    const data2 = from(parser.parse('test'))
    expect(fulltext.all(data2[0])).to.equal('testb')
  })

  it('redescriptions do not recreate entire Phrase', () => {
    const consSpy = spy()
    class Test extends phrase.Phrase {
      constructor() { consSpy() }

      static get initialState() {return {test: 'first'}}

      describe() {
        this.setState({test: 'second'})
        return <literal text={this.state.test} />
      }
    }

    parser.sentences = [<Test />]

    const data1 = from(parser.parse(''))
    expect(fulltext.all(data1[0])).to.equal('first')
    expect(consSpy).to.have.been.calledOnce

    const data2 = from(parser.parse(''))
    expect(fulltext.all(data2[0])).to.equal('second')
    expect(consSpy).to.have.been.calledOnce
  })

  it('nested redescriptions do not recreate entire Phrase', () => {
    const consSpy = spy()
    const subConsSpy = spy()

    class SubTest extends phrase.Phrase {
      constructor() { subConsSpy('sub') }

      describe() { return <literal text={this.props.val} /> }
    }

    class Test extends phrase.Phrase {
      constructor() { consSpy('main') }

      static get initialState() { return {test: 'first'} }

      describe() {
        this.setState({test: 'second'})
        return <SubTest val={this.state.test} />
      }
    }

    parser.sentences = [<Test />]

    const data1 = from(parser.parse(''))
    expect(fulltext.all(data1[0])).to.equal('first')
    expect(consSpy).to.have.been.calledOnce
    expect(subConsSpy).to.have.been.calledOnce

    const data2 = from(parser.parse(''))
    expect(fulltext.all(data2[0])).to.equal('second')
    expect(consSpy).to.have.been.calledOnce
    expect(subConsSpy).to.have.been.calledOnce
  })
})
