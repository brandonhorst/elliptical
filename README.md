lacona
======

[![Build Status](https://img.shields.io/travis/lacona/lacona.svg?style=flat)](https://travis-ci.org/lacona/lacona)
[![Join Gitter Chat](https://img.shields.io/badge/gitter-join%20chat-00DA75.svg)](https://gitter.im/lacona/lacona)

`lacona` is a Javascript library for building interactive natural language text interfaces. It *parses* and *interacts with* input according to a dynamic but well-defined schema.

First of all, `lacona` is **not**:

- a library to extract meaningful information from unstructured text, like [`nltk`](http://www.nltk.org/). `lacona` does not know anything about English (or any other language's) grammar. Rather, it parses a subset of all possible strings according to a predefined schema.
- a voice command system, like Siri. `lacona` only operates on text (though it could conceivably as a layer in such an application).
- a static string parser, like regular expressions. `lacona` schemata are dynamic -  can execute arbitrary code, pull data from external sources, and interact with one another. Abstractions are provided to make these complex tasks as reasonable as possible.
- designed for automated parsing. `lacona` is designed to build *interactive* textural interfaces - that is, it operates on incomplete inputs in addition to complete ones. It provides things like *intelligent suggestions*, *sorting*, *autocomplete*, and *syntax highlighting*.
- an application. `lacona` (lowercase, in a `code block`; also 'lacona library') is an open-source, general purpose language processing library. It is being developed alongside a proprietary natural language command line application called Lacona (capitalized; also 'Lacona app'), which you can learn more about at [lacona.io](http://www.lacona.io).

The beauty behind `lacona` comes from its language model. Language is modeled as a composition of *language objects* (called `phrase`s). These `phrase`s can be combined, composed, and extended to generate complex linguistic constructs easily. `phrase`s reduce natural language input to as plain Javascript objects, so the input can be acted upon. This model abstracts much of the difficulty away from the developer, allowing them to compose schemata by combining existing powerful structures. Read on below for more detail.

#Development Notice

While lacona is versioned 0.x, it is considered unstable and api is expected to change. If you would like to contribute or use Lacona, please get in touch and let me know of your plans on [Github](https://github.com/lacona/lacona), [Twitter (@brandonhorst)](https://twitter.com/brandonhorst), or by [email](mailto:brandonhorst@gmail.com).

# Installation

```
npm install lacona
```

# Testing

- `npm run validate`

# Directories

- `src`: Source (ES6/JSX)
- `lib`: Compiled source (ES5)
- `test` Tests (ES6/JSX)
- `tmp` Compiled tests (ES5)
- `doc`

# Building for the Browser

Because it is built modularly, Lacona is best consumed in the browser using [Browserify](http://browserify.org/).

# Usage Example

```jsx
/** @jsx laconaPhrase.createElement */

var lacona = require('lacona')
var laconaPhrase = require('lacona-phrase')
var parser = new lacona.Parser()

parser.grammar = (
  <sequence>
    <literal text='do' category='action' />
    <label text='something' id='whatToDo'>
      <literal text='something' value='something' />
    </label>
  </sequence>
)

var results = parser.parseArray('do som')

console.log(results)
/*
[ { words:
  [ {
    text: 'do ',
    input: true,
    category: 'action'
  }, {
    text: 'som',
    input: true,
    argument: 'something',
    category: undefined
  }, {
    text: 'ething',
    input: false,
    argument: 'something',
    category: undefined
  } ],
  score: 1,
  result: { whatToDo: 'something' }
} ]
*/
```

# Getting Started

## Why Lacona

`lacona` is used to build interactive natural language text interfaces. For certain applications, this is a much more powerful and natural interface than a traditional GUI or command line.

I want to make a tool that reminds me to do something at a certain time. The OSX/iOS Reminders app does this through a GUI interface or thorugh Siri. But we want to build a tool that allows natural language text input, because this is the easiest way for people in an office or a coffee shop using a keyboard. For ease-of-use, the tool should be able to understand anything that you would say to a friend.

When you dive into this problem, you realize that there are *tons* of ways to say this with natural language. For example:

* remind me to go shoe shopping tomorrow at 8am
* tomorrow at 8am, remind me to go shoe shopping
* remind me to go shoe shopping at 8am the day after tomorrow
* remind me to go shoe shopping tomorrow morning
* remind me to go shoe shopping on the morning of the 23rd
* remind me to go shoe shopping next monday at 8

Those are just a few examples - I'm sure you could think of many more. Moreover, if you really want the tool to "understand anything that you would say to a friend," more complicated options arise.

* remind me to go shoe shopping the day before Jake's birthday
* remind me to go shoe shopping 2 weeks before my vacation
* remind me to go shoe shopping next time I go grocery shopping

Lacona is designed to understand inputs like *these*, and it is designed to make the developer's life as simple as possible. The developer doesn't need to know the intricacies of language parsing - they can construct their language parser by combining existing building blocks.

```
'remind me to' {task name} {date and time}
-OR-
{date and time}, 'remind me to' {task name}
```

That doesn't look to bad. Because `{task name}` and a `{date and time}` are abstracted away, they can be addressed and reasoned about independently. This is exactly what `lacona` is designed to do. So let's do it!

## Technical Aside

`lacona` schemata are all written in pure Javascript. However, because if their complex nested structure, it is recommended that developers use a syntactic sugar known as [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html). JSX was developed for [React](https://facebook.github.io/react/index.html) but is not tied to the HTML DOM in any way. It provides the most elegant way to build Lacona schemata.

We recommend that you develop your schemata using JSX and transpile them using [babel](http://babeljs.io/) - that is how everything is developed internally. This guide will use JSX, as well as some ES2015 and even ES7 functionality. Though all development is possible using ES5 alone, babel compilation is highly recommended.

For an ES5 example, please see [this Gist](https://gist.github.com/bradvogel/9759b3fe50828ad6bae8).

## A Basic `lacona` Schema

Let's develop a schema to handle our Reminder tool. It will look like this.

```jsx
/** @jsx createElement */

import { createElement, Phrase } from 'lacona-phrase'
import { String } from 'lacona-phrase-string'
import { DateTime } from 'lacona-phrase-datetime'

class Reminder extends Phrase {
  describe () {
    return (
      <choice>
        <sequence>
          <literal text='remind me to ' category='action' />
          <String id='taskname' argument='reminder' />
          <literal text=' ' />
          <DateTime id='dateAndTime' />
        </sequence>
        <sequence>
          <DateTime id='dateAndTime' />
          <literal text=', remind me to ' category='action' />
          <String id='taskname' argument='reminder' />
        </sequence>
      </choice>
    )
  }
}
```

That's doesn't look too bad, huh? Let's break it down.

### JSX Pragma

Our first line is a comment.

```js
/** @jsx createElement */
```

But it's not just any comment - this is a Pragma for the Babel JSX transpiler. It means "every time you see an XML tag in this file, transform it into a call to the `createElement` function." If you want to see this transformation in action, copy the code into the [online Babel transpiler](http://babeljs.io/repl/#?experimental=false&evaluate=false&loose=true&spec=false&playground=false&code=).

If you don't include this comment, you are going get a `React is not defined` error, because the default behavior maps tags to `React.createElement`.

### Imports

```js
import { createElement, Phrase } from 'lacona-phrase'
import { String } from 'lacona-phrase-string'
import { DateTime } from 'lacona-phrase-datetime'
```

In `lacona`, schemata are called `phrase`s. They are actually classes that extend a class called `Phrase`. The `Phrase` class lives in the `lacona-phrase` module. `lacona-phrase` also contains `createElement`, which is used by the JSX transformation, so we should import that as well.

Notice that we are not even importing the `lacona` module. `lacona` is used for parsing strings - simple schema definitions do not use it. We'll use it later, don't worry.

`lacona-phrase-string` and `lacona-phrase-datetime` contain preexisting phrases. These two are core [lacona](https://github.com/lacona) phrases, but anyone can develop custom phrases.

### The Phrase Itself

```jsx
export class Reminder extends Phrase {
  describe () {
    return (
      <choice>
        <sequence>
          <literal text='remind me to ' category='action' />
          <String id='taskName' argument='reminder' />
          <literal text=' ' />
          <DateTime id='dateAndTime' />
        </sequence>
        <sequence>
          <DateTime id='dateAndTime' />
          <literal text=', remind me to ' category='action' />
          <String id='taskName' argument='reminder' />
        </sequence>
      </choice>
    )
  }
}
```

We've got a class called `Reminder` that extends `Phrase`. It has a single method called `describe` which takes no arguments. `describe` does not have any logic per se - it returns an object that is specified her with JSX syntax. This is normal - `describe` is a declarative way of specifying how a `Phrase` is defined, and it is generally fairly simple.

In this JSX syntax, all lowercase elements represent `phrase`s that are built into Lacona, and all uppercase elements should be the names of `Phrase` classes in the local scope.

Just like all Javascript functions, `describe` must return a single object. In this case, it is returning a `choice`. `choice` means "any of my child elements are valid options".

The `choice` contains two `sequence`s. `sequence` means "my child elements must occur in order."

Each `sequence` is slightly different, because there are multiple ways to say this same sentence in English, but they're not difficult to understand. Notice that some of the child elements have attributes, which are called `props`. `props` modify the behavior of `phrase`s. For example, the `literal` phrase means "match whatever string is provided in my `text` prop." The `DateTime` and `String` elements have a prop called `id`. This is used for specifying the element for the purpose of organizing its data in `results`, which we will talk about later.

The `String` elements also have a prop called `argument`. Because `String` is a custom Phrase, there is nothing special about this property. In reality, this controls `argument` output with this `String`'s `Word`'.

So all of this is just a fancy way of specifying exactly what we sent out to specify:

```
'remind me to' {task name} {date and time}
-OR-
{date and time}, 'remind me to' {task name}
```

Note that this `Phrase` is completely static. We'll deal with dynamic behavior later on in [Sources](#sources).

## Using the Parser

So we have our `Phrase`, now let's figure out how to actually parse some input according to it. Here's the code:

```jsx
/** @jsx createElement */
import { createElement } from 'lacona-phrase'
import { Parser } from 'lacona'
import { Reminder } from './reminder'

const parser = new Parser({
  grammar: <Reminder />
})

function doParse(input) {
  const parseResults = parser.parseArray(input)
  console.log(parseResults, {depth: null})
}

process.stdin.setEncoding('utf8')

process.stdin.on('readable', () => {
  const chunk = process.stdin.read()
  if (chunk !== null) {
    const input = chunk.trim()
    doParse(input)
  }
})
```

### Pragma and Imports

```js
/** @jsx createElement */

import { createElement } from 'lacona-phrase'
import { Parser } from 'lacona'
import { Reminder } from './reminder'
```

We're still using JSX, so we need our JSX pragma. This time, we're importing the `Reminder` `Phrase` that we created already, and we are also loading the `Parser` class from `lacona`. This is the class that actually does the parsing for us.
### Configuring the Parser

```jsx
const parser = new Parser({
  grammar: <Reminder />
})
```

We create an instance of the `Parser` class, and we pass it an object with a single property: `grammar`. `grammar` contains a single JSX element - the `Reminder` which we created earlier.

### Parsing

```js
function doParse(input) {
  const parseResults = parser.parseArray(input)
  console.log(parseResults, {depth: null})
}

process.stdin.setEncoding('utf8')

process.stdin.on('readable', () => {
  const chunk = process.stdin.read()
  if (chunk !== null) {
    const input = chunk.trim()
    doParse(input)
  }
})
```

There's some Node mumbo jumbo for reading text input here, but the the important part is we are calling the `parseArray` method on our `Parser` instance. We pass it a string for the input, and it returns an array of possible results. These results have a lot of data, so we will analyze them together.

## Output

Let's try it out. When we launch our app (perhaps using `babel-node`), it prompts us for input. Let's say we input `rem`, which is the beginning of "remember". Here's what it returns:

```js
[ {
  words: [
    {
      text: 'rem',
      input: true,
      category: 'action'
    }, {
      text: 'ind me to ',
      input: false
    }, {
      text: 'string',
      input: false,
      placeholder: true,
      argument: 'string'
    }, {
      text: ' ',
      input: false
    }, {
      text: 'date and time',
      input: false,
      placeholder: true
    }
  ],
  score: 0.0001,
  qualifiers: [],
  result: {}
} ]
```

Let's take a look. It is returning an array with a single item: an object with properties `words`, `score`, and `result`.

- `score`: `Number` - between 0 and 1 that represents how the results should be sorted when displayed to the user. The higher the score, the farther to the top it should sort. Note that the results from `parseArray` are *not* sorted automatically according to the score. Of course, in this case, it doesn't matter - we only have one result.
- `result`: `Any` - an object that describes the data that `lacona` has gleaned from the input. In this case, the user has not input any actual data - just the string `rem` - so `result` is empty.
- `qualifiers`: `[String]` - a list of qualifiers for this output. Qualifiers are arbitrary strings that any phrase in the parse chain can output. These can be used by the interface to distinguish between different outputs with the same `words`. For example, if a command allows you to "call Mom", but "Mom" has two different phone numbers, one could have `qualifiers: ['cell']` and the other could have `qualifiers: ['home']`. In this case, there is no ambiguity so there are no qualifiers.
- `words`: `[Word]` - describes how `lacona` understands the given input and its autocompletion suggestions. Each `Word` is an object with these properties.
    - `text`: `String` - the text itself.
    - `input`: `Boolean` is a `Boolean` that represents whether or not this word was a part of the input. If `true`, this word is a match of the input. If `input` is `false`, then this word is a suggestion.
    - `category`: `String` - an arbitrary string which can be used for syntax highlighting, which comes from the `category` property on various phrases. While any string can be used as a category, the standard categories are `action` for verbs and `conjunction` for punctuation and grammatical necessities.
    - `placeholder`: `Boolean` (optional) - represents whether the `text` is an literal recommendation, or just an indicator of possible input. Placeholders are used to make it clear to the user what they should enter as they type. If `words` contains no objects with `placeholder: true`, then the output is considered complete.
    - `argument`: `String` (optional) - the `text` prop of the highest level `<label argument={true} />`. This is used to classify output. Commands will use `<label />` to group sections of the command that can be considered independently.

Our application should take this output and display it nicely to the user. For example, this output could be rendered

> <span style='color: blue'><strong>rem</strong>ind me to</span> `string` `date and time`

In this way, we show the user a pleasant interface as they are typing their command.

### Advanced Parsing

Let's take a closer look at how the `lacona` parser works, so we will be ready to build more advanced `phrase`s. I will condense our code from earlier into a single file.

```jsx
/** @jsx createElement */
import { createElement, Phrase } from 'lacona-phrase'
import String from 'lacona-phrase-string'
import DateTime from 'lacona-phrase-datetime'
import { Parser } from 'lacona'

class Reminder extends Phrase {
  describe () {
    return (
      <choice>
        <sequence>
          <literal text='remind me to ' category='action' />
          <String id='taskName' />
          <literal text=' ' />
          <DateTime id='dateAndTime' />
        </sequence>
        <sequence>
          <DateTime id='dateAndTime' />
          <literal text=', remind me to ' category='action' />
          <String id='taskName' />
        </sequence>
      </choice>
    )
  }
}

const parser = new Parser({
  grammar: <Reminder />
})

const parseResults = parser.parseArray('tomorrow at noon, rem')
console.log(parseResults, {depth: null})
```

For the purposes of this example, we have hardcoded the input string, `rem`.

To figure out what Lacona is doing under the covers, let's imagine a ficticious function like so:

```js
parsePhrase(input: String, grammar: LaconaElement) =>
  [{remainingString: String, result: Any, score: Number, words: [Word]}]
```

It takes an `input` string and a `LaconaElement` (that is, a `Phrase` specified in JSX syntax). It parses `input` according to `grammar` and then returns an object with:

- `remainingString` - the input that has not yet been consumed
- `result` - a plain JS object that represents the understanding of the data
- `score` - a Number (0 < score <= 1) that determines the quality of the match, used for sorting
- `words` - an array of Word objects, which describe how the output should be displayed

Lacona works by recursively calling `parsePhrase`. We will trace the execution through its steps to understand how it works.

##### Root Level

When `parseArray('rem')` is called, `lacona` will call `parsePhrase('tomorrow at noon, rem', parser.grammar)`.

##### Level 1 - in `parsePhrase('tomorrow at noon, rem', parser.grammar)`

`parser.grammar` is a `LaconaElement` that points to the `Reminder` `Phrase`. `lacona` automatically instantiates `Reminder` and call `Reminder::describe()`. This returns a `<choice />`, which is another `LaconaElement`, so it will recursively call `parsePhrase('rem', <return value of Reminder::describe()>)`.

##### Level 2 - in `parsePhrase('tomorrow at noon, rem', <choice>...</choice>)`

`<choice />` is a built-in `lacona` `phrase`. It represents a branch in the parse chain. This means that it will call `parsePhrase` for each child (2, in this case), and combine their outputs. It parses them in the order that they are presented. In this case, both children are `sequence`s, so we will call them `sequence #1` and `sequence #2`.

##### Level 3 - in `parsePhrase('tomorrow at noon, rem', <sequence #1 />...</sequence>)`

`<sequence />` is a built-in `lacona` `phrase`. It parses its children one-after-the-other, passing the results of each parse to the next child. This sequence has 3 children, so it will parse them all in order.

##### Level 4 - in `parsePhrase('tomorrow at noon, rem', <literal text='remind me to ' category='action' />)`

Finally, we start doing some actual string parsing. `<literal />` is a built-in `lacona` `phrase`. It matches a literal string, specified in the `text` prop. In order to match, both the `text` and the `input` must start the same way. In this case, the `tomorrow at noon, rem` and `remind me to ` are obviously different, so this literal does not match. Therefore, it returns an empty array, meaning no results.

##### Level 3 - in `parsePhrase('tomorrow at noon, rem', <sequence #1 />...</sequence>)`

Our first child returned no results, so this entire `<sequence />` is invalid. It also returns an empty array.

##### Level 2 - in `parsePhrase('tomorrow at noon, rem', <choice>...</choice>)`

We now move on to the second child of our `<choice />`. In this case, it is another `<sequence />`, which we will call #2.

##### Level 3 - in `parsePhrase('tomorrow at noon, rem', <sequence #2 />...</sequence>)`

Just like `<sequence #1 />`, we will parse the children in order.

##### Level 4 - in `parsePhrase('tomorrow at noon, rem', <DateTime id='dateAndTime' />)`

`DateTime` is capitalized, so it is a phrase defined in the local scope. In this case, it is `DateTime` from [lacona-phrase-datetime](https://github.com/lacona/lacona-phrase-datetime). DateTime is a very complicated `Phrase`, but we don't need to worry about that complexity. All that we need to know is that it understands all the various ways to specify a specific point in time. See the source for more details, but suffice it to say that it returns an object that looks like this:

```js
[
  {
    remainingString: ' at noon, rem',
    result: new Date('2015-10-12 08:00:00'), // Date object representing tomorrow at 08:00 (8am)
    score: 0.27,
    words: [{text: 'tomorrow', input: true, argument: 'date'}]
  }, {
    remainingString: ', rem',
    result: new Date('2015-10-12 12:00:00'), // Date object representing tomorrow at 12:00 (noon)
    score: 0.23,
    words: [
      {text: 'tomorrow', input: true, argument: 'date'}
      {text: ' at ', input: true, category: 'conjunction'}
      {text: 'noon', input: true, argument: 'time'}
    ]
  }
]
```

Note that it returns two separate outputs. This means that `<DateTime />` must have a `<choice />` in it somewhere, because it has branched the parse. The first result has only consumed the string `tomorrow`, and the second result has consumed `tomorrow at noon`. As far as the `DateTime` is concerned, both of those are valid. The output that consumed fewer characters has a higher `score`.

The `result` properties are standard JavaScript objects (in this case, `Date`) that describe the *intent* of the input. Note for the branch that only consumed `tomorrow`, the `<DateTime />` is assuming a time of 08:00 (8am). `lacona` phrases are built to deal with the ambiguity of language.

##### Level 3 - in `parsePhrase('tomorrow at noon, rem', <sequence #2 />...</sequence>)`

Back to our `<sequence #2 />`. Because our first child returned two results, we need to parse the second child with the `remainingString` from both results, in the order that they were returned. Let's do the first one - ` at noon, rem`

##### Level 4 - in `parsePhrase(' at noon, rem', <literal text=', remind me to ' category='action' />)`

We know how `<literal />`s work. `at noon, rem` and `, remind me to` do not match, so this returns an empty array.

##### Level 3 - in `parsePhrase('tomorrow at noon, rem', <sequence #2 />...</sequence>)`

Now we need to parse the second child again with the second `remainingString` - `, rem`.

##### Level 4 - in `parsePhrase(', rem', <literal text=', remind me to ' category='action' />)`

Now we have a match! The input `, rem` matches the beginning of the `text` prop `, remind me to `, so we are good-to-go. The `<literal />` returns an object like this:

```js
[{
  remainingString: null,
  result: undefined,
  score: 1,
  words: [
    {text: ', rem', category: 'action', input: true},
    {text: 'ind me to ', category: 'action', input: false}
  ]
}]
```

The entire string has been *consumed*, so `remainingString` is `null`. The `literal` had no `value` prop, so the `result` is `undefined`. There are 2 `words`, one with `input === true` because it was part of the original input, and one with `input === false` because it is simply a suggestion. Both words also take on the `literal`'s `category`, an optional prop that can be used for syntax highlighting.

##### Level 3 - in `parsePhrase(null, <sequence #1 />...</sequence>)`

Now we are back in `<sequence #2 />` again. We will parse the third child in the sequence with the `remainingString` from the second child.

##### Level 4 - in `parsePhrase(null, <String id='taskName' />)`

`String` is capitalized, so it is a phrase defined in the local scope. In this case, it is `String` from [lacona-phrase-string](https://github.com/lacona/lacona-phrase-string). `String` is a very simple `Phrase`, so we can look at it directly. See the source for more details, but suffice it to say that the `String::describe()` method returns `<label text='string'><freetext ...</freetext></label>`. So we will call `parsePhrase` with that.

##### Level 5 - in `parsePharse(null, <label text='string'>...</label>)`

`label` is a built-in `lacona` `phrase`. It serves two main purposes - categorizing sections of a command according to an `argument`, and `suppress`ing parsing through the use of `placeholders`. Both functions are enabled by default, and can be disabled with `argument={false}` or `suppress={false}`.

In this case, `argument` and `suppress` are both `true`. Because `suppress` is true and `input` is `null`, the `label` will **not** parse it's child, but will instead simply return this object.

```js
[{
  remainingString: null,
  result: undefined,
  score: 0.01
  words: [{text: 'string', argument: 'string', placeholder: 'true'}]
}]
```

A short aside about `argument`s and `suppress`ion.

###### Arguments

An `argument` represents a named subset of a command. Ultimately, its purpose is to show the user what it understands a given string to represent. Take, for example, the string `text Vicky to Jake`. Without any context, that string could mean at least 2 different things:

- text the string "to Jake" a person named "Vicky"
- text the string "Vicky" to a person named "Jake"

To resolve this ambiguity, `lacona` uses `argument`s. For example, it could output:

- `[{text: 'text '}, {text: 'Vicky', argument: 'contact'}, {text: ' '}, {text: 'to Jake', argument: 'message'}]`
- `[{text: 'text '}, {text: 'Vicky', argument: 'message'}, {text: ' to '}, {text: 'Jake', argument: 'contact'}]`

Note that while `argument`s may often correspond with `result`s, they are functionally completely separate.

###### Suppression

Normally, `<label />` will call `parsePhrase` child. However, it can `suppress` this parsing in certain circumstances. When parsing is `suppress`ed, the label will instead output a `Word` with `placeholder: true`. This shows the user what they can input in that situation. Additionally, it improves performance because it prevents extraneous parsing once the input has already been parsed.

By default, `<label />` will output a `placeholder` if its `input` string is `null`, but this behavior can be modified with props.

##### Level 4 - in `parsePhrase(null, <String id='taskName' />)`

After a `Phrase` successfully parses the elements from it's `describe()` method, it simply returns the results - in this case,

```js
[{
  remainingString: null,
  result: undefined,
  score: 0.01,
  words: [{text: 'string', argument: 'string', placeholder: 'true'}]
}]
```

##### Level 3 - in `parsePhrase('rem', <sequence #2 />...</sequence>)`

We have parsed every child of our `<sequence #2 />`! All children parsed successfully, so the `<sequence />` will now combine the outputs.

- `remainingString` - the same as the last child's `remainingString`
- `result` - an object with `{<child's id prop>: <child's result>}` for each child
- `score` - the `score` of all children multiplied together
- `words` - all child `words` concatenated

At long last, the parse of `<sequence #2 />` returns

```js
[{
  remainingString: null,
  result: {
    dateAndTime: new Date('2015-10-12 12:00:00'),
    taskName: undefined
  },
  score: 0.0023,
  words: [
    {text: 'tomorrow', input: true, argument: 'date'}
    {text: ' at ', input: true, category: 'conjunction'}
    {text: 'noon', input: true, argument: 'time'}
    {text: ', rem', category: 'action', input: true},
    {text: 'ind me to ', category: 'action', input: false},
    {text: 'string', argument: 'string', placeholder: 'true'}
  ]
}]
```

##### Level 2 - in `parsePhrase('tomorrow at noon, rem', <choice>...</choice>)`

Our `<choice />` has parsed both of its children, so it returns all of the valid results. In this case, there is just the one, coming from `<sequence #2 />`.

##### Level 1 - in `parsePhrase('tomorrow at noon, rem', parser.grammar)`

Finally, we are back the top level - the `Parser`'s grammar itself. The `Parser` will automatically filter out all results whose `remainingString` is not `null` or `''`. Because our only result has `remainingString: null`, we don't need to worry about that. Therefore, it will return our final result (without the unneeded `remainingString` property).

##### Root Level

`Parser.parseArray` has finally returned! We get our final result and print it to the console:

```js
[{
  remainingString: null,
  result: {
    dateAndTime: new Date('2015-10-12 12:00:00'),
    taskName: undefined
  },
  score: 0.0023,
  words: [
    {text: 'tomorrow', input: true, argument: 'date'}
    {text: ' at ', input: true, category: 'conjunction'}
    {text: 'noon', input: true, argument: 'time'}
    {text: ', rem', category: 'action', input: true},
    {text: 'ind me to ', category: 'action', input: false},
    {text: 'string', argument: 'string', placeholder: 'true'}
  ]
}]
```

# Translating Phrases

Because the Lacona parser is so generic, you can accept sentences in any language at all, even languages with distinctly different grammatical structures. Some languages change the verb order, or the character direction, or lack spaces. Even so, lacona can make sense out of the texts and allow effective parsing.

**Coming Soon**

# Sources

So far, everything we have seen about Phrases are completely static. Lacona also allows for dynamic phrases. However, in order to manage complexity, dynamic behavior is abstracted through Sources.

Sources are owned by `Phrase`s. Each `Phrase` defines which sources it needs, and the sources are automatically managed for the `Phrase`. This is sometimes known as "sideways data loading," because the Phrase had information that does not come from its parent. It dramatically simplifies the grammar by allowing phrases to be entirely abstracted.

## An Example

```jsx
/** @jsx createElement */

import { createElement, Phrase, Source } from 'lacona-phrase'
import { readdir } from 'fs'
import { join } from 'path'
import { Parser } from 'lacona'

class DirectoryContents extends Source {
  state = []

  onCreate () {
    readdir(this.props.path, (err, files) => {
      if (!err) {
        this.setData(files)
      }
    })
  }
}

class File extends Phrase {
  observe () {
    return <DirectoryContents path={this.props.directory} />
  }

  describe () {
    const items = this.source.data.map(filename => {
      return {text: filename, value: join(this.props.directory, filename)}
    })

    return <list items={items} />
  }
}

function doParse() {
  const output = parser.parseArray('open Cal')
  console.log(output)
}

const parser = new Parser({
  grammar: (
    <sequence>
      <literal text='open ' />
      <File directory='/Applications' id='appPath' />
    </sequence>
  )
})

parser.on('update', doParse)
doParse()

/*
[]
*/

/*
[
  {
    result: {
      appPath: /Applications/Calculator.App
    },
    score: 1,
    words: [
      {text: 'open ', input: true}
      {text: 'Cal ', input: true}
      {text: 'endar.app ', input: false}
    ]
  }, {
    result: {
      appPath: /Applications/Calendar.App
    },
    score: 1,
    words: [
      {text: 'open ', input: true}
      {text: 'Cal ', input: true}
      {text: 'culator.app ', input: false}
    ]
  }
]
*/
```

### Pragma and Imports

```js
/** @jsx createElement */

import { createElement, Phrase, Source } from 'lacona-phrase'
import { readdir } from 'fs'
import { join } from 'path'
import { Parser } from 'lacona'

```

We're still using JSX, so we still need the `createElement` pragma.

We need a new class from `lacona-phrase` now - `Source`. All sources must extend this class.

For this example, we will assume a node.js environment. [`fs.readdir`](https://nodejs.org/api/fs.html#fs_fs_readdir_path_callback) is a function which asyncronously returns an array of filenames within a given directory. [`path.join`](https://nodejs.org/api/path.html#path_path_join_path1_path2) joins path components into a normalized path.

### Source Definition

```jsx
class DirectoryContents extends Source {
  onCreate () {
    this.setData([])

    readdir(this.props.path, (err, files) => {
      if (!err) {
        this.setData(files)
      }
    })
  }
}
```

We create a new class called `DirectoryContents` that extends `Source`. It has a single method, `onCreate()`. `onCreate` is automatically called whenever a new source is instantiated, which is managed automatically.

Every `Source` has a method called `setData(newData)`. This replaces `Source`'s `data` property, and forces all `Phrase`s using this source to be re-described.

In this case, the `onCreate()` method calls setData immediately to set the initial data to an empty string. It then kicks off an asyncronous request (`readdir()`). When the callback is called, it will call `setData` again, this time with actual data. In this case, setData is an array of strings, but it can be any JavaScript object or literal.

**Always** use `setData(newData)` to update the `Source`'s data - never mutate the `data` property directly.

Note that for developers coming from React: `setData` does **not** merge object properties like `setState`. It always replaces the data object entirely.

### Phrase Definition

```jsx
class File extends Phrase {
  observe () {
    return <DirectoryContents path={this.props.directory} />
  }

  describe () {
    const items = this.source.data.map(filename => {
      return {text: filename, value: join(this.props.directory, filename)}
    })

    return <list items={items} />
  }
}
```

Here we have a typical `Phrase` called `TempFile`. In addition to the normal `describe()` method, we have a new one - `observe()`. `observe()` works very similarly to `describe()` - it takes no arguments, and it declaratively returns a `LaconaElement` (specified with JSX). However, in this case, the `LaconaElement`s represent `Source`s, not `Phrase`s. The similarities are intentional - `Source`s can be used and combined in the same powerful way that `Phrase`s can be.

Just like `describe()`, `observe()` can make use of `this.props`. And, of course, it can pass props to the `Source`s that it uses.

In this case, we are returning a single `LaconaElement` - `<DirectoryContents />`. We are passing it a prop called `path`, which is really just one of our props called `directory`.

We don't need to know how `<DirectoryContents />` works. We don't care if it's sync or async. All we know is that if we give it a `path`, it will set its `data` to a list of filenames in the directory specified by that `path`.

In our `describe()` method, we are making use of this source. The `Phrase` specified by the `LaconaElement` returned from `observe()` is accessible as `this.source`. We can access the `data` property directly. In this case, we are converting the array of `filename`s to an `items` array for use in a `<list />` `Phrase`.

Note that in this situation, `describe()` is actually going to be called twice - once when the `File` phrase is created (and `this.source.data` is an empty array), and once when the `readdir` callback is called and the source calls `setData` again. The `Phrase` will know that its source has new data, and it will call `describe` again. Now, `this.source.data` is a full array.

### Tying Things Up

```jsx
function doParse() {
  const output = parser.parseArray('open Cal')
  console.log(output)
}

const parser = new Parser({
  grammar: (
    <sequence>
      <literal text='open ' />
      <File directory='/Applications' id='appPath' />
    </sequence>
  )
})

parser.on('update', doParse)
doParse()
```

Here, we are providing the `lacona` `Parser` with a `grammar` just as before. However, we also see something new - `Parser` is a standard Node [`EventEmitter`](https://nodejs.org/api/events.html). You can subscribe to an event called `update`, which will be triggered when any `Source` used in the `grammar` is updated. In this case, we're calling `doParse` right after `parser` is instantiated, and after its `update` event.

### Output

```js
/*
[]
*/

/*
[
  {
    result: {
      appPath: /Applications/Calculator.App
    },
    score: 1,
    words: [
      {text: 'open ', input: true}
      {text: 'Cal ', input: true}
      {text: 'endar.app ', input: false}
    ]
  }, {
    result: {
      appPath: /Applications/Calendar.App
    },
    score: 1,
    words: [
      {text: 'open ', input: true}
      {text: 'Cal ', input: true}
      {text: 'culator.app ', input: false}
    ]
  }
]
*/
```

We see that `console.log` is called twice. The first time it is called (immediately), the output is an empty array. The `DirectoryContents` `Source` had no data, so the `File` returned a `<list />` with no items.

The second `console.log` is called only a few fractions of a second later, but this time with data. The `readdir` call has triggered the callback, updating the `Source`'s `data` property, triggering the `parser::update` event, and ultimately causing a reparse with the desired list items.

The `Phrase` is still fully declarative. All of the external interaction and the asyncronous behavior are relegated to the `Source`.

# API Reference

## Built-in Phrases

All builtin phrases start with lowercase letters. These are the core building-blocks that all custom Phrases are built atop.
