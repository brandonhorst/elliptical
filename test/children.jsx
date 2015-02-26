/** @jsx phrase.createElement */
/* eslint-env mocha */
import es from 'event-stream'
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('children', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('passes children as props', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        expect(this.props.children).to.have.length(2)
        expect(this.props.children[0].constructor).to.equal('literal')
        expect(this.props.children[0].props).to.eql({text: 'a'})
        expect(this.props.children[0].children).to.eql([])
        expect(this.props.children[1].constructor).to.equal('literal')
        expect(this.props.children[1].props).to.eql({text: 'b'})
        expect(this.props.children[1].children).to.eql([])

        done()
        return <literal /> // whatever
      }
    }
    Test.additions = {config: 'test'}

    parser.sentences = [
      <Test>
        <literal text='a' />
        <literal text='b' />
      </Test>
    ]
    es.readArray(['']).pipe(parser)
  })

  it('flattens children as props', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        expect(this.props.children).to.have.length(3)
        expect(this.props.children[0].constructor).to.equal('literal')
        expect(this.props.children[0].props).to.eql({text: 'a'})
        expect(this.props.children[0].children).to.eql([])
        expect(this.props.children[1].constructor).to.equal('literal')
        expect(this.props.children[1].props).to.eql({text: 'b'})
        expect(this.props.children[1].children).to.eql([])
        expect(this.props.children[2].constructor).to.equal('literal')
        expect(this.props.children[2].props).to.eql({text: 'c'})
        expect(this.props.children[2].children).to.eql([])

        done()
        return <literal /> // whatever
      }
    }
    Test.additions = {config: 'test'}

    const literals = [<literal text='b' />, <literal text='c' />]
    parser.sentences = [
      <Test>
        <literal text='a' />
        {literals}
      </Test>
    ]
    es.readArray(['']).pipe(parser)
  })
})
