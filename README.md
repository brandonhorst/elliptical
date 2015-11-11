lacona
======

[![Build Status](https://img.shields.io/travis/lacona/lacona.svg?style=flat)](https://travis-ci.org/lacona/lacona)
[![Join Gitter Chat](https://img.shields.io/badge/gitter-join%20chat-00DA75.svg)](https://gitter.im/lacona/lacona)

`lacona` is a Javascript library for building interactive natural language text interfaces. It *parses* and *interacts with* input according to a dynamic but well-defined schema.

First of all, `lacona` is *not*:

- a library to extract meaningful information from unstructured text, like [`nltk`](http://www.nltk.org/). `lacona` does not know anything about English (or any other language's) grammar. Rather, it parses a subset of all possible strings according to a predefined schema.
- a voice command system, like Siri. `lacona` only operates on text (though it could conceivably as a layer in such an application).
- a static string parser, like regular expressions. `lacona` schemata can execute arbitrary code, pull data from external sources, and interact with one another. Abstractions are provided to make these complex tasks as reasonable as possible.
- *only* a parser. `lacona` is designed to help create interactive textural interfaces - things like *intelligent suggestions*, *autocomplete*, and *syntax highlighting*.
- an application. `lacona` (lowercase, in a `code block`; also 'lacona library') is an open-source, general purpose language processing library. It is being developed alongside a proprietary natural language command line application called Lacona (capitalized; also 'Lacona app'), which you can learn more about at [lacona.io](http://www.lacona.io).

The beauty behind `lacona` comes from its language model. Language is modeled as a composition of *language objects* (called `phrase`s). These `phrase`s can be combined, composed, and extended to generate complex linguistic constructs easily. This model abstracts much of the difficulty away from the developer, allowing them to compose schemata by combining existing powerful structures. Read on below for more detail.

#Development Notice

While lacona is versioned 0.x, it is concidered unstable and api is expected to change. If you would like to contribute or use Lacona, please get in touch and let me know of your plans on [Github](https://github.com/lacona/lacona), [Twitter (@brandonhorst)](https://twitter.com/brandonhorst), or by [email](mailto:brandonhorst@gmail.com).

# Installation

```
npm install lacona
```

# Testing

- `npm run validate`

# Directories

- `src`: Source (ES6/JSX)
- `lib`: Compiled source (ES5)
- `test`
- `doc`

# Building for the Browser

Because it is built modularly, Lacona is best consumed in the browser using Browserify.

# Usage Example

```javascript
/** @jsx laconaPhrase.createElement */

var lacona = require('lacona')
var laconaPhrase = require('lacona-phrase')
var parser = new lacona.Parser()

parser.grammar = (
	<sequence>
		<literal text='do' category='action' />
		<argument text='something' id='whatToDo'>
			<literal text='something' value='something' />
		</argument>
	</sequence>
)

var results = parser.parseArray('do som')

console.log(results)
/*
[ { words:
     [ { text: 'do ',
         input: true,
         argument: undefined,
         category: 'action' },
       { text: 'som',
         input: true,
         argument: 'something',
         category: undefined },
       { text: 'ething',
         input: false,
         argument: 'something',
         category: undefined } ],
    score: 1,
    result: { whatToDo: 'something' } } ]
*/
```

# Getting Started

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

We recommend that you develop your schemata using JSX and transpile them using [babel](http://babeljs.io/) - that is how everything is developed internally. This guide will use JSX, as well as some ES2015 functionality (also compiled with babel). Please see [`lacona` without JSX](#lacona-without-jsx) if you don't want to transpile your code.

## A Basic `lacona` Schema

Let's develop a schema to handle our Reminder tool.

```jsx
/** @jsx createElement */

import {createElement, Phrase} from 'lacona-phrase'
import String from 'lacona-phrase-string'
import DateTime from 'lacona-phrase-datetime'

class Reminder extends Phrase {
	describe () {
		return (
			<choice>
				<sequence>
					<literal text='remind me to ' />
					<String id='taskname' />
					<literal text=' ' />
					<DateTime id='dateAndTime' />
				</sequence>
				<sequence>
					<DateTime id='dateAndTime' />
					<literal text=', remind me to ' />
					<String id='taskname' />
				</sequence>
			</choice>
		)
	}
}
```

That's not too bad, huh? Let's break it down.

### JSX Pragma

Our first line is a comment.

```js
/** @jsx createElement */
```

But it's not just any comment - this is a Pragma for the Babel JSX transpiler. It means "every time you see an XML tag in this file, transform it into a call to the `createElement` function." If you want to see this transformation in action, copy the code into the [online Babel transpiler](http://babeljs.io/repl/#?experimental=false&evaluate=false&loose=true&spec=false&playground=false&code=).

If you don't include this comment, you are going get `React is not defined`, because the default behavior maps tags to `React.createElement`.

### Imports

```js
import {createElement, Phrase} from 'lacona-phrase'
import String from 'lacona-phrase-string'
import {DateTime} from 'lacona-phrase-datetime'
```

In `lacona`, schemata are called `phrase`s. They are actually `class`es that extend a class called `Phrase`. The `Phrase` class lives in the `lacona-phrase` module. `lacona-phrase` also contains `createElement`, which is used by the JSX transformation, so we should import that as well.

Notice that we are not even importing the `lacona` module. `lacona` is used for parsing strings - simple schema definitions do not use it. We'll use it later, don't worry.

`lacona-phrase-string` and `lacona-phrase-datetime` contain preexisting phrases. These two are core [lacona](https://github.com/lacona) phrases, but anyone can develop phrases.

Note that `lacona-phrase-string` only exports a single default object, but `lacona-phrase-datetime` exports multiple, so you need to specify it by name in the destructuring.

### The Phrase Itself

```jsx
export default class Reminder extends Phrase {
	describe () {
		return (
			<choice>
				<sequence>
					<literal text='remind me to ' />
					<String id='taskName' />
					<literal text=' ' />
					<DateTime id='dateAndTime' />
				</sequence>
				<sequence>
					<DateTime id='dateAndTime' />
					<literal text=', remind me to ' />
					<String id='taskName' />
				</sequence>
			</choice>
		)
	}
}
```

We've got a class called `Reminder` that extends `Phrase`. It has a single method called `describe` which takes no arguments. `describe` does not have any logic per se - it returns an object that is specified her with JSX syntax. This is normal - `describe` is a declarative way of specifying how a `Phrase` is defined - it is generally fairly simple.

In this JSX syntax, all lowercase elements represent `phrase`s that are built into Lacona, and all uppercase elements should be the names of `Phrase` classes in the local scope.

Just like all Javascript functions, `describe` must return a single object. In this case, it is returning a `choice`. `choice` means "any of my child elements are valid.

The `choice` contains two `sequence`s. `sequence` means "my child elements must occur in order."

Each `sequence` is slightly different, because there are multiple ways to say this same sentence in English, but they're not difficult to understand. Notice that some of the child elements have attributes, which are called `props`. `props` modify the behavior of `phrase`s. For example, the `literal` phrase means "match whatever string is provided in my `text` prop." The `DateTime` and `String` elements have a prop called `id`. This is used for specifying the element for the purpose of organizing its data in `results`, which we will talk about later.

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
import {createElement} from 'lacona-phrase'
import {Parser} from 'lacona'
import Reminder from './reminder'

const parser = new Parser({
	grammar: <Reminder />
})

function doParse(input) {
	const parseResults = parser.parseArray(input)
	console.log(inspect(parseResults, {depth: null}))
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
import {createElement} from 'lacona-phrase'
import {Parser} from 'lacona'
import Reminder from './reminder'
import {inspect} from 'util'
```

We're still using JSX, so we need our JSX pragma. This time, we're importing the `Reminder` `Phrase` that we created already, and we are also loading the `Parser` class from `lacona`. This is the class that actually does the parsing for us. `inspect` is just used to display the results nicely.

### Configuring the Parser

```jsx
const parser = new Parser({
	grammar: <Reminder />
})
```

We create an instance of the `Parser` class, and we pass it an object with a single property: `grammar`. `grammar` contains a single JSX element - the `Reminder` which we created earlier.

### Parsing

```
function doParse(input) {
	const parseResults = parser.parseArray(input)
	console.log(inspect(parseResults, {depth: null}))
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

## Results

Let's try it out. When we launch our app (perhaps using `babel-node`), it prompts us for input. Let's say we input `rem`, which is the beginning of "remember". Here's what it returns:

```js
[ { words:
     [ { text: 'rem',
         input: true },
       { text: 'ind me to ',
         input: false },
       { text: 'string',
         input: false,
         placeholder: true },
       { text: ' ',
         input: false },
       { text: 'date and time',
         input: false,
         placeholder: true } ],
    score: 0.0001,
    result: {} } ]
```

Let's take a look. It is returning an array with a single item: an object with keys `words`, `score`, and `result`.

- `score` is an number between 0 and 1 that represents how the results should be sorted when displayed to the user. The higher the score, the farther to the top it should sort. Note that the results from `parseArray` are *not* sorted automatically according to the score. Of course, in this case, it doesn't matter - we only have one result.
- `result` is an object that describes the data that `lacona` has gleaned from the input. In this case, the user has not input any actual data - just the string `rem` - so `result` is empty.
- `words` is an array of `word` objects, describing how `lacona` understands the given input, and its autocompletion suggestions.
		- `text` is the string itself.
		- `input` is a `Boolean` that represents whether or not the user input this particular word. If `input` is `true`, then this word is a match of the input. If `input` is `false`, then this word is a suggestion.
		- `placeholder` is a `Boolean` that represents whether the `text` is an literal recommendation, or just an indicator of possible input. Placeholders are used to make it clear to the user what they should enter as they type.

Our application should take this output and display it nicely to the user. For example, this output could be rendered

> **rem**ind me to `string` `date and time`

In this way, we show the user a pleasant interface as they are typing their query.

## Results Part 2

**Coming Soon**

# Translating Phrases

Because the format is so general, you can accept sentences in any language at all, even languages with distinctly different grammatical structures. Some languages change the verb order, or the character direction, or lack spaces. Even so, lacona can make sense out of the texts and allow effective parsing.

**Coming Soon**

# Sources

**Coming Soon**

# API Reference

**Coming Soon**
