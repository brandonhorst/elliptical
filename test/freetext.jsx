/** @jsx createElement */
/* eslint-env mocha */
import {createElement, Phrase} from 'lacona-phrase'
import chai, {expect} from 'chai'
import {Parser} from '..'
import fulltext from 'lacona-util-fulltext'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('freetext', () => {
	var parser

	beforeEach(() => {
		parser = new Parser()
	})

	it('validates input', () => {
		function validate (input) {
			return input === 'validValue'
		}

		parser.grammar = <freetext validate={validate} />

		const data1 = parser.parseArray('validValue')
		expect(data1).to.have.length(1)
		expect(fulltext.all(data1[0])).to.equal('validValue')
		expect(data1[0].result).to.equal('validValue')

		const data2 = parser.parseArray('invalidValue')
		expect(data2).to.have.length(0)
	})

	it('no validate always accepts', () => {
		parser.grammar = <freetext id='test' />

		const data = parser.parseArray('anything')
		expect(data).to.have.length(1)
		expect(fulltext.all(data[0])).to.equal('anything')
		expect(data[0].result).to.equal('anything')
	})

	it('allows consumeAll', () => {
		const valSpy = spy()

		function validate (input) {
			valSpy()
			return input === 'validValue'
		}

		parser.grammar = <freetext validate={validate} consumeAll={true} />

		const data = parser.parseArray('validValue')
		expect(data).to.have.length(1)
		expect(fulltext.all(data[0])).to.equal('validValue')
		expect(valSpy).to.have.been.calledOnce
	})

	it('allows splits on strings', () => {
		class Test extends Phrase {
			describe() {
				return (
					<sequence>
						<freetext splitOn=' ' id='validator' />
						<choice>
							<literal text=' test' />
							<literal text='thing' />
						</choice>
					</sequence>
				)
			}
		}

		parser.grammar = <Test />

		const data = parser.parseArray('anything goes test')
		expect(data).to.have.length(3)
		expect(fulltext.all(data[0])).to.equal('anything goes test')
		expect(data[0].result.validator).to.equal('anything goes')
		expect(fulltext.all(data[1])).to.equal('anything goes test test')
		expect(data[1].result.validator).to.equal('anything goes test')
		expect(fulltext.all(data[2])).to.equal('anything goes testthing')
		expect(data[2].result.validator).to.equal('anything goes test')
	})

	it('allows splits on regex (with weird parens)', () => {
		class Test extends Phrase {
			describe() {
				return (
					<sequence>
						<freetext splitOn={/(( )())/} id='validator' />
						<choice>
							<literal text=' test' />
							<literal text='thing' />
						</choice>
					</sequence>
				)
			}
		}

		parser.grammar = <Test />

		const data = parser.parseArray('anything goes test')
		expect(data).to.have.length(3)
		expect(fulltext.all(data[0])).to.equal('anything goes test')
		expect(data[0].result.validator).to.equal('anything goes')
		expect(fulltext.all(data[1])).to.equal('anything goes test test')
		expect(data[1].result.validator).to.equal('anything goes test')
		expect(fulltext.all(data[2])).to.equal('anything goes testthing')
		expect(data[2].result.validator).to.equal('anything goes test')
	})
})
