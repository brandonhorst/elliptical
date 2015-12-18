/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('extends', () => {
  var parser
  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('allows phrases that return null (for classes to be extended)', () => {
    class Noop extends phrase.Phrase {
      describe() {
        return null
      }
    }

    parser.grammar = <Noop />

    const data = parser.parseArray('')
    expect(data).to.have.length(0)
  })

  it('handles phrases that return null to be extended', () => {
    class Noop extends phrase.Phrase {
      describe() {
        return null
      }
    }

    class Extender extends phrase.Phrase {
      describe() {
        return <literal text='test' />
      }
    }
    Extender.extends = [Noop]

    parser.grammar = <Noop />
    parser.extensions = [Extender]

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
  })

  it('handles phrases with extends', () => {
    class Extended extends phrase.Phrase {
      describe() { return <literal text='test a' value='a' /> }
    }

    class Extender extends phrase.Phrase {
      describe() { return <literal text='test b' value='b' /> }
    }
    Extender.extends = [Extended]

    parser.grammar = <Extended />
    parser.extensions = [Extender]

    const data = parser.parseArray('')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('test a')
    expect(data[0].result).to.equal('a')
    expect(data[1].result).to.equal('b')
  })

  it('handles phrases extended multiple times', () => {
    class Extended extends phrase.Phrase {
      describe() { return <literal text='test a' value='a' /> }
    }

    class Extender1 extends phrase.Phrase {
      describe() { return <literal text='test b' value='b' /> }
    }
    Extender1.extends = [Extended]

    class Extender2 extends phrase.Phrase {
      describe() { return <literal text='test c' value='c' /> }
    }
    Extender2.extends = [Extended]

    parser.grammar = <Extended />
    parser.extensions = [Extender1, Extender2]

    const data = parser.parseArray('')
    expect(data).to.have.length(3)
    expect(text(data[0])).to.equal('test a')
    expect(data[0].result).to.equal('a')
    expect(text(data[1])).to.equal('test b')
    expect(data[1].result).to.equal('b')
    expect(text(data[2])).to.equal('test c')
    expect(data[2].result).to.equal('c')
  })

  it('handles recursive phrases with extends', () => {
    class Extended extends phrase.Phrase {
      describe() {
        return (
          <sequence>
            <literal text='a' value='a' id='a' />
            {this.props.allowRecurse ? <Extended allowRecurse={false} id='b' /> : null}
          </sequence>
        )
      }
    }

    class Extender extends phrase.Phrase {
      describe() {
        return <literal text='b' value='b' />
      }
    }
    Extender.extends = [Extended]

    parser.grammar = <Extended allowRecurse />
    parser.extensions = [Extender]

    const data = parser.parseArray('ab')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('ab')
    expect(data[0].result).to.eql({a: 'a', b: 'b'})
  })

  it('handles phrases with extends in sequence', () => {
    class Test extends phrase.Phrase {
      describe() { return (
        <sequence>
          <literal text='test ' />
          <Extended id='test' />
        </sequence>
      )}
    }

    class Extended extends phrase.Phrase {
      describe() { return <literal text='a' value='a' /> }
    }

    class Extender extends phrase.Phrase {
      describe() { return <literal text='b' value='b' /> }
    }
    Extender.extends = [Extended]

    parser.grammar = <Test />
    parser.extensions = [Extender]

    const data = parser.parseArray('')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('test a')
    expect(data[0].result.test).to.equal('a')
    expect(text(data[1])).to.equal('test b')
    expect(data[1].result.test).to.equal('b')
  })

  it('accepts extends being removed', () => {
    class Extended extends phrase.Phrase {
      describe() { return <literal text='test a' /> }
    }

    class Extender extends phrase.Phrase {
      describe() { return <literal text='test b' /> }
      static get extends() {return [Extended]}
    }

    parser.grammar = <Extended />
    parser.extensions = [Extender]

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(2)
    expect(text(data1[0])).to.equal('test a')
    expect(text(data1[1])).to.equal('test b')

    parser.extensions = []

    const data2 = parser.parseArray('')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('test a')
  })
})
