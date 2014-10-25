Lacona
======

Lacona is a Javascript library for parsing and predicting natural language according to an arbitrary but well-defined schema.

In other words, you tell Lacona how some language works, and it will help people write it, and tell you what they are saying.

Of course, language is complicated, so Lacona provides some powerful tools to simplify it. You can create sentences with well-defined "phrases" that make the process much simpler.

Lacona may seem similar to tookits like `nltk`, but it is conceptually very different. They both take a natural language string, parse it, and tokenize it. The difference is that `nltk` has some concept of English grammar which it uses to parse arbitrary sentences and give you the component words and phrases and how they fit together. Lacona cannot do that. Lacona does not know anything about English grammar. It does, however, know exactly what a time looks like in an English sentence (1pm, 0423, quarter til 9, 14 minutes ago), and it can parse that and return a Javascript `Date` object for use in an arbitrary program.

So in short, `nltk` is a low-level parser that breaks any string according to its real-world grammar. Lacona understands a well-defined number of phrases, but extracts the data in a way that doesn't require any knowledge of the real-world grammar. And of course, you can give it new schemas to help it understand new things.

#Development Notice!

Lacona is under _very active development_ right now. Absolutely nothing is set in stone, and absolutely nothing outside the `test` directory is expected to work properly. I'm _really_ excited about this project, and I'm hoping to have some cool demos out in the near future. Of course, if you would like to contribute, start opening up issues on [Github](https://github.com/brandonhorst/lacona) or find me on Twitter at [@brandonhorst](https://twitter.com/brandonhorst).

#Installation

```
npm install lacona
```

#Testing

Lacona contains a full set of BDD unit tests. They are designed to run both in node.js and in the browser (including PhantomJS).

- `gulp lint`: run jshint
- `gulp test`: run tests in node.js
- `gulp phantom`: run tests in PhantomJS
- `npm test`: run jshint, and then tests in both node.js and PhantomJS. If any fail, it will not proceed.

You can also run the tests in a browser of your choice by running `gulp build-browser-tests` and then opening `test/mocha.html`.

#Directories

- `lib`: Javascript source
- `test`: Unit tests
- `test/mocha.html`: Page for running tests in browser
- `dist`: Browserify'd classes, for running in browser
- `doc`: Documentation files

#Building for the Browser

`npm install`: Browserify the source (`dist/lacona.js`), and uglify it (`dist/lacona.min.js`).

#Usage

##Node

```javascript
var lacona = require('lacona');
var parser = new lacona.Parser();
```

##Browser

```html
<script src="node_modules/dist/lacona.min.js"></script>
<script>
	var parser = new lacona.Parser();
</script>
```

`lacona` doesn't do anything special with browserification. Feel free to include it as a module in your project, and then browserify it yourself.

`lacona` does not yet support AMD, and it is not on Bower.

#Getting Started

I want to make a tool that reminds me to do something at a certain time. One solution would be to provide a "description" input, a date-picker, and a time-picker. That would work fine, but let's try it with natural language. The tool should understand anything that you would say to a friend. For example:

* remind me to wash the car tomorrow at 8am
* tomorrow at 8am, remind me to wash the car
* remind me to wash the car at 8am the day after tomorrow
* remind me to wash the car tomorrow morning
* remind me to wash the car on the morning of the 23rd
* remind me to wash the car next monday at 8

You can see that these sentences are basically saying the same thing, but could go about it in different ways. There are a limited number of possibilities, but you can see how parsing these options is a dizzying task.

Lacona makes it easy. You provide a grammar explaining what it can expect, like this pseudocode:

```
'remind me to' <task name> <date and time> OR <date and time>, 'remind me to' <task name>
```

As long as Lacona knows what a `<task name>` and a `<date and time>` look like, it is good to go. And, as it turns out, it knows *exactly* what they look like.

Making a Lacona grammar to understand those options is easy:

```json
{
	"root": {
		"type": "choice",
		"children": [
			[
				"remind me to",
				{ "type": "freetext", "id": "taskName" },
				{ "type": "datetime", "id": "dateAndTime" }
			], [
				{ "type": "datetime", "id": "dateAndTime" },
				", remind me to",
				{ "type": "freetext", "id": "taskName" }
			]
		]
	}
}
```

That may look a bit complicated, but it's not. It's a JSON Object saying with a single `root` element, which is a `choice` between two `sequence`s.

One important thing to notice is the `id` properties. These are a logical name for the data that any given `phrase` contains, and they govern how the data is provided back. In this case, let's say the user inputs

	remind me to wash the car tomorrow at 8am

The parse output would be a single JSON object contains a `result` property that looks like this (presuming that "today" is June 13, 2014):

```javascript
{
	"taskName": "wash the car",
	"dateAndTime": Date("Sat Jun 14 2014 8:00:00 GMT-0400 (EDT)")
}
```

Notice that the important bits are extracted, and provided in an easily-usable way. It would be simple to take this object and send it to the interface or server.

Now the beauty is this: Let's I also want to support Spanish speakers. I could modify Grammar a bit, and accept strings like:

	recuérdame lavar la coche mañana a las 8

But the `result` property returned would be in exactly the same format.

```javascript
{
	"taskName": "lavar la coche",
	"dateAndTime": Date("Sat Jun 14 2014 8:00:00 GMT-0400 (EDT)")
}
```

Because the format is so general, you can accept sentences in any language at all, even languages with distinctly different grammatical structures. In Japanese, the verbs generally come last. In Arabic, text is written right-to-left. In Chinese languages, spaces are not used. Even so, Lacona can make sense out of the texts and allow effective parsing.

By means of example, let's support Spanish in our Schema, shall we? Please note that an array as a schema element is shorthand for `{type: 'sequence', separator: ' ', children: [array contents]}`.

```json
{
	"schemas": [ {
		"langs": ["en", "default"],
		"root": {
			"type": "choice",
			"children": [
				[
					"remind me to",
					{ "type": "freetext", "id": "taskName" },
					{ "type": "datetime", "id": "dateAndTime" }
				], [
					{ "type": "datetime", "id": "dateAndTime" },
					", remind me to",
					{ "type": "freetext", "id": "taskName" }
				]
			]
		}
	}, {
		"langs": ["es"],
		"root": {
			"type": "choice",
			"children": [
				[
					"recuérdame ",
					{ "type": "freetext", "id": "taskName" },
					{ "type": "datetime", "id": "dateAndTime" }
				], [
					{ "type": "datetime", "id": "dateAndTime" },
					", recuérdame",
					{ "type": "freetext", "id": "taskName" }
				]
			]
		}

	} ]
}
```

When a string is parsed, information about the string is also provided. The full output for the input:

	remind me to feed the dog tom

will look like this:

```javascript
{
	"match": [
		{"string": "remind me to"},
		{"string": " "},
		{"string": "feed the dog"},
		{"string": " "}
	],
	"suggestion": {
		"words": [
			{"string": "tomorrow"}
		],
		"charactersComplete": 3
	},
	"completion": [],
	"result": {
		"taskName": "feed the dog",
		"dateAndTime": Date("Sat Jun 14 2014 8:00:00 GMT-0400 (EDT)")
	}
}
```

Note that `partOfSpeech` will be implemented shortly, and `charactersComplete` will be changing slightly to allow for fuzzy matching.

#Parsing

You can create a new Parser instance with

```javascript
var parser = new lacona.Parser(options);
```

The `Parser` object follows patterns that should be familiar to node.js users, and should be very simple to learn for everyone else.

To teach a `Parser` some phrases, you call

```javascript
parser.understand(grammar);
```

To start parsing phrase, you call

```javascript
parser.parse(stringToParse);
```

To get the results of a parse, `Parser` will emit events. These can be captured with

```javascript
parser.on(event, handler);
```

where `event` is a string and `handler` is a function. Whenever an event named `event` is emitted, the `handler` will be called.

When `parse` is called, `data` events will be emitted with a single `OutputOption` argument for every valid result in the order that they are recieved. Then, `end` will be emitted. If something goes wrong, `error` will be emitted with a single `Error` argument.

If you are implementing a UI that will be maintaining state between requests, look into `lacona-stateful` ([GitHub](https://github.com/brandonhorst/lacona-stateful), [npm](https://www.npmjs.org/package/lacona-stateful)).

#Reference

Remember, nothing is set in stone yet.

[Parser](doc/parser.md)
[Grammar](doc/grammar.md)
[Phrases](doc/phrases.md)
