// /** @jsx createElement */
// /* eslint-env mocha */
// import { expect } from 'chai'
// import { text } from './_util'
// import { Parser } from '..'
// import { createElement, Phrase } from 'lacona-phrase'
//
// function from(i) {const a = []; for (let x of i) a.push(x); return a}
//
// describe('fuzzy', () => {
//   let parser
//
//   beforeEach(() => {
//     parser = new Parser()
//   })
//
//   it('supports fuzzy matching within a phrase', () => {
//     parser.grammar = <literal text='a simple test' fuzzy />
//
//     const data = parser.parseArray($1)
//     expect(data).to.have.length(1)
//     expect(text(data[0])).to.equal('a simple test')
//     expect(data[0].suggestion[0].string).to.equal('a')
//     expect(data[0].suggestion[0].input).to.be.true
//     expect(data[0].suggestion[1].string).to.equal(' ')
//     expect(data[0].suggestion[1].input).to.be.false
//     expect(data[0].suggestion[2].string).to.equal('s')
//     expect(data[0].suggestion[2].input).to.be.true
//     expect(data[0].suggestion[3].string).to.equal('i')
//     expect(data[0].suggestion[3].input).to.be.false
//     expect(data[0].suggestion[4].string).to.equal('m')
//     expect(data[0].suggestion[4].input).to.be.true
//     expect(data[0].suggestion[5].string).to.equal('p')
//     expect(data[0].suggestion[5].input).to.be.false
//     expect(data[0].suggestion[6].string).to.equal('l')
//     expect(data[0].suggestion[6].input).to.be.true
//     expect(data[0].suggestion[7].string).to.equal('e ')
//     expect(data[0].suggestion[7].input).to.be.false
//     expect(data[0].suggestion[8].string).to.equal('te')
//     expect(data[0].suggestion[8].input).to.be.true
//     expect(data[0].suggestion[9].string).to.equal('st')
//     expect(data[0].suggestion[9].input).to.be.false
//   })
//
//   it('rejects misses properly with fuzzy matching', () => {
//     parser.grammar = <literal text='a simple test' fuzzy />
//
//     const data = parser.parseArray($1)
//     expect(data).to.have.length(0)
//   })
//
//   it('suggests properly when fuzzy matching is enabled', () => {
//     parser.grammar = <literal text='a simple test' fuzzy />
//
//     const data = parser.parseArray($1)
//     expect(data).to.have.length(1)
//     expect(data[0].suggestion[0].string).to.equal('a simple test')
//     expect(data[0].suggestion[0].input).to.be.false
//     expect(text(data[0])).to.equal('a simple test')
//   })
//
//   it('can do fuzzy matching with regex special characters', () => {
//     parser.grammar = <literal text='[whatever]' fuzzy />
//
//     const data = parser.parseArray($1)
//     expect(data).to.have.length(1)
//     expect(text(data[0])).to.equal('[whatever]')
//     expect(data[0].suggestion[0].string).to.equal('[')
//     expect(data[0].suggestion[0].input).to.be.true
//     expect(data[0].suggestion[1].string).to.equal('whatever')
//     expect(data[0].suggestion[1].input).to.be.false
//     expect(data[0].suggestion[2].string).to.equal(']')
//     expect(data[0].suggestion[2].input).to.be.true
//   })
//
//   it('supports sequence when fuzzy is enabled', () => {
//     parser.grammar = (
//       <sequence>
//         <literal text='abc' fuzzy />
//         <literal text='def' fuzzy />
//       </sequence>
//     )
//
//     const data = parser.parseArray($1)
//     expect(data).to.have.length(1)
//     expect(text(data[0])).to.equal('def')
//     expect(text(data[0])).to.equal('abc')
//     expect(data[0].suggestion[0].string).to.equal('d')
//     expect(data[0].suggestion[0].input).to.be.false
//     expect(data[0].suggestion[1].string).to.equal('e')
//     expect(data[0].suggestion[1].input).to.be.true
//     expect(data[0].suggestion[2].string).to.equal('f')
//     expect(data[0].suggestion[2].input).to.be.false
//   })
//
//   it('rejects when the word itself does not complete the match', () => {
//     parser.grammar = (
//       <sequence>
//         <literal text='abc' fuzzy />
//         <literal text='def' fuzzy />
//       </sequence>
//     )
//
//     const data = parser.parseArray($1)
//     expect(data).to.be.empty
//   })
//
//   it('assigns a score for different match types', () => {
//     parser.grammar = (
//       <choice>
//         <literal text='abc' fuzzy />
//         <literal text='abcdef' fuzzy />
//         <literal text='xxxabc' fuzzy />
//         <literal text='xaxbxc' fuzzy />
//       </choice>
//     )
//
//     const data = parser.parseArray($1)
//     expect(data).to.have.length(4)
//     expect(data[0].score).to.equal(1)
//     expect(data[1].score).to.equal(1)
//     expect(data[2].score).to.equal(0.5)
//     expect(data[3].score).to.equal(0.25)
//   })
//
//   it('assigned scores can be overridden', () => {
//     parser.grammar = (
//       <choice>
//         <literal text='abc' fuzzy score={0.1} />
//         <literal text='abcdef' fuzzy score={0.2} />
//         <literal text='xxxabc' fuzzy score={0.3} />
//         <literal text='xaxbxc' fuzzy score={0.4} />
//       </choice>
//     )
//
//     const data = parser.parseArray($1)
//     expect(data).to.have.length(4)
//     expect(data[0].score).to.equal(0.1)
//     expect(data[1].score).to.equal(0.2)
//     expect(data[2].score).to.equal(0.3)
//     expect(data[3].score).to.equal(0.4)
//   })
// })
