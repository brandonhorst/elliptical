# Elliptical

[![Build Status](https://img.shields.io/travis/laconalabs/elliptical.svg?style=flat)](https://travis-ci.org/laconalabs/elliptical)
[![Join Gitter Chat](https://img.shields.io/badge/gitter-join%20chat-00DA75.svg)](https://gitter.im/laconalabs/elliptical)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/v/elliptical.svg)](https://www.npmjs.com/package/elliptical)

Elliptical is a Javascript library for building interactive natural
language text interfaces.

It is framework-independent and runs on both the client and the server.
It works with any written language that can be represented with Unicode.
It is functional, compositional, easily extensible, and it's got
[great docs](http://elliptical.laconalabs.com).

There are addons to allow for
[internationalization](https://github.com/brandonhorst/elliptical-translate),
[linguistic extension](https://github.com/brandonhorst/elliptical-extend),
[sideways data loading](https://github.com/brandonhorst/elliptical-observe),
and more.

There are pre-built phrases for parsing English
[dates and times](https://github.com/laconalabs/elliptical-datetime),
[numbers](https://github.com/laconalabs/elliptical-number),
[urls](https://github.com/laconalabs/elliptical-url),
[phone numbers](https://github.com/laconalabs/elliptical-phone),
[email addresses](https://github.com/laconalabs/elliptical-email),
[arbitrary strings](https://github.com/laconalabs/elliptical-string),
and more. Of course, you can develop your own phrases.

To see an example of Elliptical in action, check out the
[Lacona App](http://www.lacona.io).

[**Full Documentation**](http://elliptical.laconalabs.com)

## Installation

```
npm install elliptical
```

## What is an Interactive Natural Language Interface?

Interactive Natural Language Interfaces allow users to enter data in a natural,
unstructured way, but still have interactive nicities like
*intelligent suggestions*, *sorting*, *autocomplete*, and *syntax highlighting*.

Well-designed interfaces can give users an unprecedented level of
expressiveness and efficiency, while still being easy to learn and use.

Elliptical helps you build interfaces like this. You create natural language
grammars by combining linguistic building blocks (called `Phrases`).
Elliptical uses that grammar to process strings, and returns objects that
describe the input, offer suggestions, and allow for intelligent sorting.

Elliptical also uses the user input to build plain Javascript objects,
so you can easily do things based upon the user's input.

Lacona is extensible, allowing phrases to have smart internationalization
functionality, make use of external data sources, and more.
This allows for powerful, dynamic grammars that are still easy to understand.

Elliptical is **not**:

- a library to extract meaningful information from unstructured text,
  like [`nltk`](http://www.nltk.org/). Elliptical does not know anything about
  English (or any other language's) grammar. Rather, it parses
  possible strings according to a predefined schema.
- a voice command system, like Siri. Elliptical only operates on text
  (though it could conceivably be used as a layer in such an application).
- a machine learning system. Elliptical parses strings according to a preset
  algorithm
- a static string parser, like regular expressions. Elliptical schemata are
  dynamic - can execute arbitrary code, pull data from external sources, and
  interact with one another. Abstractions are provided to make these complex
  tasks as reasonable as possible.
- designed for automated parsing. Elliptical is designed to build
  *interactive* textural interfaces for relatively short inputs.

## Example

You can play with this example yourself at
[elliptical-example](https://github.com/laconalabs/elliptical-example).

```jsx
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
        <list items={countryData} strategy='fuzzy' />
      </label>
    )
  }
}

// Build our grammar out of Elements
const grammar = (
  <sequence>
    <literal text='flights ' />
    <choice id='direction'>
      <literal text='from ' value='from' />
      <literal text='to ' value='to' />
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
    score: 0.5673076923076923
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
    score: 0.024999999999999998
  }]
*/
```
