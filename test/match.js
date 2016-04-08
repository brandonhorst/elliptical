import {match} from '../src/match'
import {expect} from 'chai'

describe('match', () => {
  it('handles start matches', () => {
    const output = match({text: 'superman', input: 'super', strategy: 'start'})
    expect(output.remaining).to.be.null
    expect(output.score).to.equal(1)
    expect(output.words).to.eql([
      {text: 'super', input: true},
      {text: 'man', input: false}
    ])
  })

  it('handles fully consumed start matches', () => {
    const output = match({text: 'super', input: 'superman', strategy: 'start'})
    expect(output.remaining).to.equal('man')
    expect(output.score).to.equal(1)
    expect(output.words).to.eql([
      {text: 'super', input: true}
    ])
  })

  it('handles null matches', () => {
    const output = match({text: 'super', input: null, strategy: 'start'})
    expect(output.remaining).to.equal(null)
    expect(output.score).to.equal(1)
    expect(output.words).to.eql([
      {text: 'super', input: false}
    ])
  })

  it('handles contain matches', () => {
    const output = match({text: 'superman', input: 'man', strategy: 'contain'})
    expect(output.remaining).to.equal(null)
    expect(output.score).to.be.lessThan(1)
    expect(output.words).to.eql([
      {text: 'super', input: false},
      {text: 'man', input: true}
    ])
  })

  it('handles contain at the beginning', () => {
    const output = match({text: 'superman', input: 'super', strategy: 'contain'})
    expect(output.remaining).to.equal(null)
    expect(output.score).to.equal(1)
    expect(output.words).to.eql([
      {text: 'super', input: true},
      {text: 'man', input: false}
    ])
  })

  it('handles fuzzy at the beginning', () => {
    const output = match({text: 'superman', input: 'super', strategy: 'fuzzy'})
    expect(output.remaining).to.equal(null)
    expect(output.score).to.equal(1)
    expect(output.words).to.eql([
      {text: 'super', input: true},
      {text: 'man', input: false}
    ])
  })

  it('handles fuzzy anywhere', () => {
    const output = match({text: 'superman', input: 'man', strategy: 'fuzzy'})
    expect(output.remaining).to.equal(null)
    expect(output.score).to.be.lessThan(1)
    expect(output.words).to.eql([
      {text: 'super', input: false},
      {text: 'man', input: true}
    ])
  })

  it('handles acronym fuzzy', () => {
    const output = match({text: 'Remind me to', input: 'rmt', strategy: 'fuzzy'})
    expect(output.remaining).to.equal(null)
    expect(output.score).to.be.equal(0.5)
    expect(output.words).to.eql([
      {text: 'R', input: true},
      {text: 'emind ', input: false},
      {text: 'm', input: true},
      {text: 'e ', input: false},
      {text: 't', input: true},
      {text: 'o', input: false}
    ])
  })

  it('handles capital fuzzy', () => {
    const output = match({text: 'GoodAsDone', input: 'gd', strategy: 'fuzzy'})
    expect(output.remaining).to.equal(null)
    expect(output.score).to.equal(0.4)
    expect(output.words).to.eql([
      {text: 'G', input: true},
      {text: 'oodAs', input: false},
      {text: 'D', input: true},
      {text: 'one', input: false}
    ])
  })

  it('handles true fuzzy', () => {
    const output = match({text: 'superman', input: 'sm', strategy: 'fuzzy'})
    expect(output.remaining).to.equal(null)
    expect(output.score).to.be.lessThan(0.3)
    expect(output.words).to.eql([
      {text: 's', input: true},
      {text: 'uper', input: false},
      {text: 'm', input: true},
      {text: 'an', input: false}
    ])
  })

  it('handles true fuzzy with special characters', () => {
    const output = match({
      text: '[super] - (man)',
      input: ']-(',
      strategy: 'fuzzy'
    })
    expect(output.remaining).to.equal(null)
    expect(output.score).to.be.lessThan(1)
    expect(output.words).to.eql([
      {text: '[super', input: false},
      {text: ']', input: true},
      {text: ' ', input: false},
      {text: '-', input: true},
      {text: ' ', input: false},
      {text: '(', input: true},
      {text: 'man)', input: false}
    ])
  })

  it('handles start with burrs', () => {
    const output = match({
      text: 'hörst',
      input: 'horst',
      strategy: 'start'
    })
    expect(output.remaining).to.equal('')
    expect(output.score).to.equal(1)
    expect(output.words).to.eql([
      {text: 'hörst', input: true}
    ])
  })

  it('handles contain with burrs', () => {
    const output = match({
      text: 'hörst',
      input: 'o',
      strategy: 'contain'
    })
    expect(output.remaining).to.equal(null)
    expect(output.score).to.be.lessThan(1)
    expect(output.words).to.eql([
      {text: 'h', input: false},
      {text: 'ö', input: true},
      {text: 'rst', input: false}
    ])
  })

  it('handles fuzzy with burrs', () => {
    const output = match({
      text: 'hörst',
      input: 'o',
      strategy: 'fuzzy'
    })
    expect(output.remaining).to.equal(null)
    expect(output.score).to.be.lessThan(1)
    expect(output.words).to.eql([
      {text: 'h', input: false},
      {text: 'ö', input: true},
      {text: 'rst', input: false}
    ])
  })
})