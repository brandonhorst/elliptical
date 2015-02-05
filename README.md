lacona
======

[![Join the chat at https://gitter.im/lacona/lacona](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/lacona/lacona?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://img.shields.io/travis/lacona/lacona.svg?style=flat)](https://travis-ci.org/lacona/lacona)
[![Coverage Status](https://img.shields.io/coveralls/lacona/lacona.svg?style=flat)](https://coveralls.io/r/lacona/lacona)
[![Join Gitter Chat](https://img.shields.io/badge/gitter-join%20chat-00DA75.svg)](https://gitter.im/lacona/lacona)

lacona is a Javascript library for parsing and predicting natural language according to an arbitrary but well-defined schema.

In other words, you tell lacona how some language works, and it will help people write it, and tell you what they are saying.

Of course, language is complicated, so lacona provides some powerful tools to simplify it. You can create sentences with well-defined "phrases" that make the process much simpler.

lacona may seem similar to tookits like `nltk`, but it is conceptually very different. They both take a natural language string, parse it, and tokenize it. The difference is that `nltk` has some concept of English grammar which it uses to parse arbitrary sentences and give you the component words and phrases and how they fit together. lacona cannot do that. lacona does not know anything about English grammar. It does, however, know exactly what a time looks like in an English sentence (1pm, 0423, quarter til 9, 14 minutes ago), and it can parse that and return a Javascript `Date` object for use in an arbitrary program.

So in short, `nltk` is a low-level parser that breaks any string according to its real-world grammar. lacona understands a well-defined number of phrases, but extracts the data in a way that doesn't require any knowledge of the real-world grammar. And of course, you can give it new schemas to help it understand new things.

#Development Notice!

lacona is under _very active development_ right now. Absolutely nothing is set in stone, and absolutely nothing outside the `test` directory is expected to work properly. I'm _really_ excited about this project, and I'm hoping to have some cool demos out in the near future. Of course, if you would like to contribute, start opening up issues on [Github](https://github.com/lacona/lacona) or find me on Twitter at [@brandonhorst](https://twitter.com/brandonhorst).

#Installation

```
npm install lacona
```

#Testing and Linting

lacona contains a full set of BDD unit tests. They are designed to run both in node.js and in the browser (including PhantomJS).

- `npm test`: run unit tests on node
- `npm run lint`: run jshint on packages and tests
- `npm run validate`: lint, then test
- `npm run cover`: generate coverage report

#Directories

- `lib`: Javascript source
- `test`: Unit tests
- `doc`: Documentation files

#Building for the Browser

Because it is built modularly, Lacona is best consumed in the browser using Browserify.

#Usage

```javascript
var lacona = require('lacona');
var parser = new lacona.Parser();
```

#Getting Started

I want to make a tool that reminds me to do something at a certain time. One solution would be to provide a "description" input, a date-picker, and a time-picker. That would work fine, but let's try it with natural language. The tool should understand anything that you would say to a friend. For example:

* remind me to wash the car tomorrow at 8am
* tomorrow at 8am, remind me to wash the car
* remind me to wash the car at 8am the day after tomorrow
* remind me to wash the car tomorrow morning
* remind me to wash the car on the morning of the 23rd
* remind me to wash the car next monday at 8

You can see that these sentences are basically saying the same thing, but could go about it in different ways. There are a limited number of possibilities, but you can see how parsing these options is a dizzying task.

lacona makes it easy. You provide a grammar explaining what it can expect, like this pseudocode:

```
'remind me to' <task name> <date and time> OR <date and time>, 'remind me to' <task name>
```

As long as lacona knows what a `<task name>` and a `<date and time>` look like, it is good to go. And, as it turns out, it knows *exactly* what they look like.

Making a lacona grammar to understand those options is easy:

```javascript
var lacona = require('lacona');
var freetext = require('lacona-phrase-freetext');
var datetime = require('lacona-phrase-datetime').datetime;

var reminder = lacona.createPhrase({
	name: "brandonhorst/reminder",
	describe: function () {
		return lacona.choice({children: [
			lacona.sequence({children: [
				lacona.literal({text: 'remind me to '}),
				freetext({id: 'taskName'}),
				lacona.literal({text: ' '}),
				datetime({id: 'dateAndTime'})
			]}),
			lacona.sequence({children: [
				datetime({id: 'dateAndTime'})
				lacona.literal({text: ', remind me to '}),
				freetext({id: 'taskName'}),
			]})
		]});
	}
};
```

That may look a bit complicated, but it's not. It's a call to `lacona.createPhrase` which is passed a single object with two properties: `name` and `describe`. `describe` returns a single element, `lacona.choice`, which has some nested elements inside of it.

One important thing to notice is the `id` properties. These are a logical name for the data that any given `phrase` contains, and they govern how the data is provided back. In this case, let's say the user inputs

	remind me to wash the car tomorrow at 8am

The parse output would be a single JSON object containing a `result` property that looks like this (presuming that "today" is June 13, 2014):

```javascript
{
	taskName: "wash the car",
	dateAndTime: Date("Sat Jun 14 2014 8:00:00 GMT-0400 (EDT)")
}
```

Notice that the important bits are extracted, and provided in an easily-usable way. It would be simple to take this object and send it to the interface or server.

Now the beauty is this: Let's I also want to support Spanish speakers. I could modify the phrase a bit, and accept strings like:

	recuérdame lavar la coche mañana a las 8

But the `result` property returned would be in exactly the same format.

```javascript
{
	taskName: "lavar la coche",
	dateAndTime: Date("Sat Jun 14 2014 8:00:00 GMT-0400 (EDT)")
}
```

Because the format is so general, you can accept sentences in any language at all, even languages with distinctly different grammatical structures. Some languages change the verb order, or the character direction, or lack spaces. Even so, lacona can make sense out of the texts and allow effective parsing.

By means of example, let's support Spanish in our Phrase, shall we?

```javascript
var remindMe = lacona.createphrase({
	name: 'brandonhorst/remindme',
	translations: [{
		langs: ['en', 'default'],
		describe: function () {
			return lacona.literal('remind me to ');
		}
	}, {
		langs: ['es'],
		describe: function () {
			return lacona.literal('recuérdame ');
		}
	}]
});

var reminder = lacona.createPhrase({
	name: 'brandonhorst/reminder',
	describe: function () {
		return lacona.choice({children: [
			lacona.sequence({children: [
				remindMe(),
				freetext({id: 'taskName'}),
				lacona.literal({text: ' '}),
				datetime({id: 'dateAndTime'})
			]}),
			lacona.sequence({children: [
				datetime({id: 'dateAndTime'})
				lacona.literal({text: ', '}),
				remindMe(),
				freetext({id: 'taskName'}),
			]})
		]});
	}
};
```

When a string is parsed, information about the string parse status is also provided. This is useful for displaying the input in a meaningful way. If the grammar above is supplied with this input:

	remind me to feed the dog tom

the full output object will look like this:

```javascript
{
	match: [
		{string: "remind me to "},
		{string: "feed the dog"},
		{string: " "}
	],
	suggestion: {
		words: [
			{string: "tomorrow"}
		],
		charactersComplete: 3
	},
	completion: [],
	result: {
		taskName: "feed the dog",
		dateAndTime: Date("Sat Jun 14 2014 8:00:00 GMT-0400 (EDT)")
	}
}
```

Note that `partOfSpeech` will be implemented shortly, and `charactersComplete` will be changing slightly to allow for fuzzy matching.

#Parsing

You can create a new Parser instance with

```javascript
var parser = new lacona.Parser(options);
```
To teach a `Parser` some phrases, you call set the `sentences` property.

```javascript
parser.sentences = [reminder()];
```

The parser is actually just a standard node `Transform` stream. It accepts strings and outputs objects.

You can consume it by handling the `data` event or piping it to a Writable stream. The stream is in `objectMode`, and each entry is an object with `event` and `id` properties and maybe a `data` property. `event` will be either `'start'`, `'end'`, or `'data'`, which mark the beginning and end of a specific parse. All output for a specific input string will have the same numeric `id`. `start` events will always happen in `id` order, but `end` and `data` events may not.

```js
{
	event: eventName,
	id: numericId,
	data: data
}
```

When a new string is parsed, an object with `event` `'start'` will be emitted. Then, `data` events will be emitted with a single `OutputOption` in the `data` property for every valid result, in the order that they are recieved. Then, an `end` event will be emitted.

If you are implementing a UI that will be maintaining state between requests, look into `lacona-addon-stateful` ([GitHub](https://github.com/lacona/lacona-addon-stateful), [npm](https://www.npmjs.org/package/lacona-addon-stateful)).

If you need lacona for a simple application and do not want to deal with streams, look into `lacona-addon-simple`, ([GitHub](https://github.com/lacona/lacona-addon-simple), [npm](https://www.npmjs.org/package/lacona-addon-simple))

#Reference

The following documents are out-of-date:

[Parser](doc/parser.md)
[Grammar](doc/grammar.md)
[Phrases](doc/phrases.md)
