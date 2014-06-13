Lacona
======

Lacona is a Javascript library for parsing and predicting natural language an arbitrary well-defined schema.

In other words, you tell Lacona how some language works, and it will help people write it, and tell you what they are saying.

Of course, language is complicated, so Lacona provides some powerful tools to simplify it. You can create sentences with well-defined "phrases" that make the process much simpler.

##Let's Have an Example

I want to make a tool that reminds me to do something at a certain time. One solution would be to provide a "description" input, a date-picker, and a time-picker. That would work fine, but let's try it with natural language. The tool should understand anything that you would say to a friend. For example:

* remind me to wash the car tomorrow at 8am
* tomorrow at 8am, remind me to wash the car
* remind me to wash the car at 8am the day after tomorrow
* remind me to wash the car tomorrow morning
* remind me to wash the car on the morning of the 23rd
* remind me to wash the car next monday at eight

You can see that these sentences are basically saying the same thing, but could go about it in different ways. But there are a limited number of possibilities. Nobody would say "remind wash the car to 8am of the tomorrow." You can see how parsing these options is a dizzying task.

Lacona makes it easy. You provide a grammar explaining what it can expect:

    "remind me to" <task-name> <date/time> OR <date/time>, "remind me to" <task-name>

As long as Lacona knows what a <task-name> and a <date/time> look like, it is good to go. And, as it turns out, it knows _exactly_ what they look like.

Making a Lacona grammar to understand those options is easy:

	{
		root: {
			type: 'choice',
			children: [
				{
					type: 'sequence'
					children: [
						'remind me to',
						{
							type: 'freetext'
							id: 'taskName'
						},
						{
							type: 'datetime'
							id: 'dateAndTime'
						}
					]
				},
				{
					type: 'sequence'
					children: [
						{
							type: 'datetime'
							id: 'dateAndTime'
						},
						', remind me to',
						{
							type: 'freetext'
							id: 'taskName'
						}
					]
				}
			]
		},
		sentence: true
	}

That may look a bit complicated, but it's not. It's a JSON Object saying with a single `root` element, which is a `choice` between two `sequence`s. It can be thought of as a tree, and here's a diagram: #Diagram on draw.io#

One important thing to notice is the `id` properties. These are a logical name for the data that any given `phrase` contains, and they govern how the data is provided back. In this case, let's say the user inputs

	remind me to wash the car tomorrow at 8am

The return value would be a single JSON object that looks like this (presuming that "today" is June 13, 2014):

	{
		taskName: "wash the car",
		dateAndTime: Date(Sat Jun 14 2014 8:00:00 GMT-0400 (EDT))
	}

Notice that the important bits are extracted, and provided in an easily-usable way. It would be simple to take this object and send it to the interface or server.

Now the beauty is this: Let's I also want to support Spanish speakers. I could modify Grammar a bit, and accept strings like:

	recuérdame lavar la coche mañana a las ocho

But the data returned would be in exactly the same format.

	{
		taskName: "lavar la coche",
		dateAndTime: Date(Sat Jun 14 2014 8:00:00 GMT-0400 (EDT))
	}

Because the format is so general, you can accept sentences in any language at all:

	#provide examples in other languages#

#Reference

##lacona

You can access everything you need to throught the `lacona` module. From node:

	var lacona = require('lacona')

From the browser (exposes a global object called `lacona`):

	<script type="text/javascript" src="build/lacona.min.js" />

`lacona` contains `Parser`, which handles most of the necessary tools that you will need, as well as `utils` which contains some useful functions.

###Parser

`Parser` is a constructor that takes no arguments. Instantiate a new `Parser` with

	var parser = new lacona.Parser()

The `Parser` object follows patterns that should be familiar to node.js users, and should be very simple to learn for everyone else.

####`understand(grammar)`

Take a single `grammar`, containing a `scope` and any number of `phrase`s. Any phrases passed in will be available to all other `phrase`s, both for extension and precidence, and for inclusion.

Returns the `Parser` instance for chaining.

####`use(middleware)`

Takes a middleware function that will be used to modulate the data coming from Lacona. All middleware `use`d will be executed in order. The most common use for this is to take the data and transform it into something that can be displayed. While this would not be useful on the server or in a framework like AngularJS, it could come in handy for simple sites that want to make use of Lacona's functionality.

`middleware` must be a function that takes 2 arguments, `data` which represents the actual data coming from Lacona (or previous middleware), and a callback `done`. The function is expected to modulate `data` in some way and call `done` with an `Error` or nothing. The next middleware will be called, or the last middleware will call the `data` event handler.

Returns the `Parser` instance for chaining.

####`on(event, handler)`

This allows you to set handlers that respond to the parser's events. Just like node.js streams, `Parser` will trigger 3 events: `data`, `end`, and `error`. To handle one of these events, just pass the name of the event as the first argument, and a `Function` to handle it as the second.

#####`data`

This event is triggered as soon as the `Parser` gets a successful parsing structure. It is passed a single argument, `option`, which is a representation of the parse (after being passed through all middleware). These may be called in any order. If order matters, ... #Figure this out#

#####`end`

Called with no arguments when all possible options have been delivered. `data` will never be called after `end` is, for a single parse.

#####`error`

Something went wrong. `end` will not be called.

##High-level Constructs

####`schema`

	phrase || [ phrase ]

####`phrase`
	{
		name: String [required]
		root: element [required]
		sentence: Boolean [default: false]
		extends: [ String ]
		precedes: [ String ]
	}

`name` is the name by which this phrase will be referred to from other phrases.

`root` is the first `element` of the parse tree for this phrase.

If `sentence` is `true`, then the Lacona Parser will try to parse input through this `phrase`. Otherwise, it will only be used when referenced in the `type` property of an `element` in a `sentence`.

####`element`
	
	String || {
		type: String (required)
		id: String
		optional: Boolean (default: false)
		...
	}

If a `String` string is provided instead of an `Object`, this is shorthand for this `element`:

	{
		type: 'literal'
		display: string
	}

`type` must be the name of any `phrase` that Lacona `understand`s, or one of the built-in `phrase`s.

`id` is the key in the returned `results` object.

If `optional` is true, an input string would be valid whether or not it contains this element.

Any other properties provided will be used by the `phrase` specified by `type`

##Built-in `phrase`s

###Groups

####`choice`

	{
		children: [ element ] (required)
	}

####`sequence`

	{
		children: [ element ] (required)
		separator: element (default: ' ')
	}

####`queue`

	{
		children : [ element ] (required)
	}

####`repeat`
	{
		child: element (required)
		separator: element (default: ' ')
	}

####`literal`

	{
		display: String (required)
		value: String
	}

Handles a single literal string `display`, and results in the value `value`.

####`value`

The `value` phrase allows you define how your element is parsed with code. This is sometimes necessary but makes maintainability and translation very difficult. Please avoid using it wherever possible - it removes all of the benefit of Lacona.

	{
		compute: String (Function(inputString, data, done))
	}

`compute` must be the name of a function stored in the `scope` that accepts 3 arguments. `inputString` is all of the currently un-parsed text. `data` is a callback that accepts a single argument, `suggestion`:

	{
		display: String
		value: String
	}

`display` is the actual piece of `inputString` that should be handled by this `value`, and `value` is the object that should be added to the `result`. `data` can be called any number of times, but should only be called once per `suggestion`. `done` accepts an `Error` argument if an error occurred, or nothing. `data` should never be called after `done` has been called.


