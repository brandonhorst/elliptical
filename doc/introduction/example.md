# Example

```
/** @jsx createElement */
import {createElement, compile} from 'elliptical'

// Some data to work with
const countryData = [
  {text: "China (People's Republic of)", value: 'CN'},
  {text: 'Ireland', value: 'IE'},
  {text: 'Macedonia (the former Yugoslav Republic of)', value: 'MK'},
  {text: 'United Kingdom of Great Britain and Northern Ireland', value: 'IE'},
  {text: 'United States', value: 'US'}
]

// Define a Phrase
const Country = {
  describe () {
    return (
      <label text='Country'>
        <list items={countryData} fuzzy />
      </label>
    )
  }
}

// Build our grammar out of Elements
const grammar = (
  <sequence>
    <literal text='flights ' />
    <choice id='direction'>
      <literal text=' from ' value='from' />
      <literal text=' to ' value='to' />
    </choice>
    <Country id='country' />
  </sequence>
)

// Obtain a parse function from our grammar
const parse = compile(grammar)

// Parse based upon a given query
const outputs = parse('flights to irela')
console.log(outputs)

/*
  [{ // direct match
    words: [
      {text: 'flights', input: true},
      {text: ' to ', input: true},
      {text: 'Irela', input: true, argument: 'Country'},
      {text: 'nd', input: false, argument: 'Country'}
    ]},
    results: {
      direction: 'to',
      country: 'IE'
    },
    score: 1
  }, { // mid-string match
    words: [
      {text: 'flights', input: true},
      {text: ' to ', input: true},
      {text: 'United Kingdom of Great Britain and Northern ', input: false, argument: 'Country'},
      {text: 'Ireland', input: true, argument: 'Country'}
    ]},
    results: {
      direction: 'to',
      country: 'GB'
    },
    score: 0.75
  }, { // fuzzy match
    words: [
      {text: 'flights', input: true},
      {text: ' to ', input: true},
      {text: 'Macedon', input: false, argument: 'Country'},
      {text: 'i', input: true, argument: 'Country'},
      {text: 'a (the fo', input: false, argument: 'Country'},
      {text: 'r', input: true, argument: 'Country'},
      {text: 'm', input: false, argument: 'Country'},
      {text: 'e', input: true, argument: 'Country'},
      {text: 'r Yugos', input: false, argument: 'Country'},
      {text: 'la', input: true, argument: 'Country'},
      {text: 'v Republic of)', input: false, argument: 'Country'}
    ]},
    results: {
      direction: 'to',
      country: 'MK'
    },
    score: 0.5
  }]
*/
```
