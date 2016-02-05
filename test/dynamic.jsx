/** @jsx createElement */
/* eslint-env mocha */
import _ from 'lodash'
import { createElement, Phrase, Source } from 'lacona-phrase'
import chai, { expect } from 'chai'
import { Parser } from '..'
import { text } from './_util'
import { spy } from 'sinon'

chai.use(require('sinon-chai'))

describe('dynamic', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('calls observe for a specific input', () => {
    class TestSource extends Source {
      onCreate () {
        this.setData(_.repeat(this.props.input, 3))
      }
    }

    function fetch (input) {
      return <TestSource input={input} />
    }

    function describe (data) {
      return <literal text={data} value={data} />
    }

    parser.grammar = <dynamic observe={fetch} describe={describe} />
    const data = parser.parseArray('b')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('bbb')
    expect(data[0].result).to.equal('bbb')
  })

  it('calls fetch for a specific input, and handles async data', (done) => {
    const updateSpy = spy()

    class TestSource extends Source {
      onCreate () {
        process.nextTick(() => {
          this.setData(_.repeat(this.props.input, 3))
        })
      }
    }

    function fetch (input) {
      return <TestSource input={input} />
    }

    function describe (data = '') {
      return <literal text={data} value={data} />
    }

    parser.grammar = <dynamic observe={fetch} describe={describe} />
    parser.on('update', updateSpy)

    const data1 = parser.parseArray('b')
    expect(data1).to.have.length(0)
    process.nextTick(() => {
      expect(updateSpy).to.have.been.calledOnce

      const data2 = parser.parseArray('b')
      expect(data2).to.have.length(1)
      expect(text(data2[0])).to.equal('bbb')
      expect(data2[0].result).to.equal('bbb')
      done()
    })
  })


  it('emptys fetched sources on deactivate', (done) => {
    const updateSpy = spy()

    class TestSource extends Source {
      onCreate () {
        process.nextTick(() => {
          this.setData(_.repeat(this.props.input, 3))
        })
      }
    }

    function fetch (input) {
      return <TestSource input={input} />
    }

    function describe (data = '') {
      return <literal text={data} value={data} />
    }

    parser.grammar = <dynamic observe={fetch} describe={describe} />
    parser.activate()

    const data1 = parser.parseArray('b')
    expect(data1).to.have.length(0)
    process.nextTick(() => {
      parser.deactivate()
      parser.activate()
      const data2 = parser.parseArray('b')
      expect(data2).to.have.length(0)
      process.nextTick(() => {
        const data3 = parser.parseArray('b')
        expect(data3).to.have.length(1)
        expect(text(data3[0])).to.equal('bbb')
        expect(data3[0].result).to.equal('bbb')
        done()
      })
    })
  })

  it('calls fetch for two different inputs on the same parse', () => {
    class TestSource extends Source {
      onCreate () {
        this.setData(`${this.props.input}batman${this.props.input}`)
      }
    }

    function fetch (input) {
      return <TestSource input={input} />
    }

    function describe (data) {
      return <literal text={data} value={data} />
    }

    class Test extends Phrase {
      describe () {
        return (
          <choice>
            <sequence>
              <literal text='test' />
              <dynamic observe={fetch} describe={describe} id='dynamic' />
            </sequence>
            <dynamic observe={fetch} describe={describe} id='dynamic' />
          </choice>
        )
      }
    }

    parser.grammar = <Test />
    const data = parser.parseArray('testb')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('testbbatmanb')
    expect(data[0].result).to.eql({dynamic: 'bbatmanb'})
    expect(text(data[1])).to.equal('testbbatmantestb')
    expect(data[1].result).to.eql({dynamic: 'testbbatmantestb'})
  })

  it('fetch for undefined input, but still calls describe with observe', () => {
    class TestSource extends Source {
      onCreate () {
        this.setData(this.props.input + 'superman')
      }
    }

    function fetch (input) {
      return <TestSource input={input || 'def'} />
    }

    function describe (data) {
      return <literal text={data} value='aaa' />
    }

    class Test extends Phrase {
      describe () {
        return (
          <choice>
            <sequence>
              <literal text='test' />
              <dynamic observe={fetch} describe={describe} id='dynamic' />
            </sequence>
            <dynamic observe={fetch} describe={describe} id='dynamic' />
          </choice>
        )
      }
    }

    parser.grammar = <Test />
    const data = parser.parseArray('tes')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('testdefsuperman')
    expect(data[0].result).to.eql({dynamic: 'aaa'})
    expect(text(data[1])).to.equal('tessuperman')
    expect(data[1].result).to.eql({dynamic: 'aaa'})
  })
})
