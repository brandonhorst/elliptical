# Example

```
/** @jsx createElement */
import {createElement, createParser} from 'elliptical'

const Country = {
  observe () {
    return <CountrySource />
  },
  describe ({data}) {
    const countryItems = data.map(country => {
      return {text: country.name, value: country.alpha2_code}
    })

    return (
      <label text='Country'>
        <list items={countryItems} fuzzy />
      </label>
    )
  }
}

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

const parser = createParser(grammar)

document.getElementById('parse-input').onclick = () => {
  const query = document.getElementById('elliptical-input').value
  const outputs = parser.parse(query)
  console.log(outputs)
}

/*
For input 'flights to irela':

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
