elliptical
======

[![Build Status](https://img.shields.io/travis/laconalabs/elliptical.svg?style=flat)](https://travis-ci.org/laconalabs/elliptical)
[![Join Gitter Chat](https://img.shields.io/badge/gitter-join%20chat-00DA75.svg)](https://gitter.im/laconalabs/elliptical)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/v/elliptical.svg)](https://www.npmjs.com/package/elliptical)

Elliptical is a Javascript library for building interactive natural
language text interfaces.

It is framework-agnostic and it runs on both the client and the server.
It is language-agnostic, modular, expressive, functional,
compositional, and extensible.

## Installation

```
npm install elliptical
```

## What is an Interactive Natural Language Interface?

Interactive Natural Language Interfaces allow users to enter data in a natural,
unstructured way, but provide interactive nicities like
*intelligent suggestions*, *sorting*, *autocomplete*, and *syntax highlighting*.

Well-designed interfaces can give users an unprecedented level of
expressiveness and efficiency, while still being easy to learn and use.

Elliptical helps you build interfaces like this. You create natural language
grammars by combining linguistic building blocks (called `Phrases`).
Elliptical uses that grammar to process strings, and returns objects that
describe the input, offer suggestions, and allow for intelligent sorting.

Elliptical also constructs objects that describe the input in a programmatic
way, so you can easily do things based upon the user's input.

`Phrases` can easily make use of external data sources, allowing
for dynamic grammars that are still easy to understand.

Elliptical is **not**:

- a library to extract meaningful information from unstructured text,
like [`nltk`](http://www.nltk.org/). Elliptical does not know anything about
English (or any other language's) grammar. Rather, it parses
possible strings according to a predefined schema.
- a voice command system, like Siri. Elliptical only operates on text
(though it could conceivably as a layer in such an application).
- a static string parser, like regular expressions. Elliptical schemata are
dynamic -  can execute arbitrary code, pull data from external sources, and
interact with one another. Abstractions are provided to make these complex
tasks as reasonable as possible.
- designed for automated parsing. Elliptical is designed to build
*interactive* textural interfaces for relatively short inputs.
- an application. Elliptical is an open-source, general purpose
language processing library. It is being developed alongside a
proprietary natural language command line application called
[Lacona](http://lacona.io), but it is entirely general-purpose.

## Example

```jsx
/** @jsx createElement */
import {createElement, createParser} from 'elliptical'
import request from 'request'
import Observable from 'zen-observable'

// Define a Source
function CountrySource () {
  const url = 'http://services.groupkt.com/country/get/all'
  return new Observable(observer => {
    observer.next([])

    request(url, (err, response, body) => {
      if (err) {
        observer.error(err)
      } else {
        observer.next(body)
      }
    })
  })
})

// Define a Phrase
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
const {parse} = createParser(grammar)

// Whenever a user clicks a button, parse the contents of a text field
document.getElementById('parse-input').onclick = () => {
  const query = document.getElementById('elliptical-input').value
  const outputs = parse(query)
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
