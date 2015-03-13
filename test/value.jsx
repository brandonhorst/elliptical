/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('value', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('suggests a value', () => {
    function fun() {
      return [{text: 'tex', value: 'val'}]
    }

    parser.sentences = [<value compute={fun} />]

    const data = from(parser.parse('te'))
    expect(data).to.have.length(1)
    expect(data[0].result).to.equal('val')
    expect(fulltext.suggestion(data[0])).to.equal('tex')
  })

  it('suggests a value (generator)', () => {
    function *fun() {
      yield {text: 'tex', value: 'val'}
    }

    parser.sentences = [<value compute={fun} />]

    const data = from(parser.parse('te'))
    expect(data).to.have.length(1)
    expect(data[0].result).to.equal('val')
    expect(fulltext.suggestion(data[0])).to.equal('tex')
  })

  it('can access props its function (if bound)', () => {
    class Test extends phrase.Phrase {
      fun() {
        return [{text: this.props.myVar}]
      }

      describe() { return <value compute={this.fun.bind(this)} /> }
    }

    parser.sentences = [<Test myVar='myVal' />]
    const data = from(parser.parse('my'))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('myVal')
  })

  it('can override fuzzy settings', () => {
    function fun (input, data, done) {
      return [
        {text: 'tst', value: 'non-fuzzy'},
        {text: 'test', value: 'fuzzy'}
      ]
    }

    parser.sentences = [<value compute={fun} fuzzy='none' />]
    parser.fuzzy = 'all'

    const data = from(parser.parse('tst'))
    expect(data).to.have.length(1)
    expect(fulltext.match(data[0])).to.equal('tst')
    expect(data[0].result).to.equal('non-fuzzy')
  })
})
