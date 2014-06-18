Lacona
======

Lacona is a Javascript library for parsing and predicting natural language according to an arbitrary well-defined schema.

In other words, you tell Lacona how some language works, and it will help people write it, and tell you what they are saying.

Of course, language is complicated, so Lacona provides some powerful tools to simplify it. You can create sentences with well-defined "phrases" that make the process much simpler.

#Develoment Notice!

Lacona is under _very active development_ right now. Absolutely nothing is set in stone, and absolutely nothing outside the `test` directory is expected to work properly. I'm _really_ excited about this project, and I'm hoping to have some cool demos out in the near future. Of course, if you would like to contribute, start opening up issues on [Github](https://github.com/brandonhorst/lacona) or find me on Twitter at [@brandonhorst](https://twitter.com/brandonhorst).

##Let's Have an Example

I want to make a tool that reminds me to do something at a certain time. One solution would be to provide a "description" input, a date-picker, and a time-picker. That would work fine, but let's try it with natural language. The tool should understand anything that you would say to a friend. For example:

* remind me to wash the car tomorrow at 8am
* tomorrow at 8am, remind me to wash the car
* remind me to wash the car at 8am the day after tomorrow
* remind me to wash the car tomorrow morning
* remind me to wash the car on the morning of the 23rd
* remind me to wash the car next monday at 8

You can see that these sentences are basically saying the same thing, but could go about it in different ways. But there are a limited number of possibilities. Nobody would say "remind wash the car to 8am of the tomorrow." You can see how parsing these options is a dizzying task.

Lacona makes it easy. You provide a grammar explaining what it can expect:

    "remind me to" <task name> <date and time> OR <date and time>, "remind me to" <task name>

As long as Lacona knows what a `<task name>` and a `<date and time>` look like, it is good to go. And, as it turns out, it knows _exactly_ what they look like.

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

	recuérdame lavar la coche mañana a las 8

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
		children: [ element ] (required),
		separator: element (default: ' ')
	}

####`queue`

	{
		children : [ element ] (required),
	}

####`repeat`
	{
		child: element (required),
		separator: element (default: ' ')
	}

###Static Elements

####`literal`

	{
		display: String (required),
		value: String
	}

Handles a single literal string `display`, and results in the value `value`.

####`freetext`

	{
		regex: RegExp || String
	}

Handles any string that is matched by the passed in `RegExp` (or `String`, which is evaluated as a `RegExp`). The value is the same as the matched string.

####`integer`

	{
		max: Number [default: 9007199254740992],
		min: Number [default: -9007199254740992]
	}

Handles an integer. Will not accept a number with a decimal mark, but will allow thousands separators. Right now, it will not accept integers written out in words, but maybe someday.

####`float` (not yet implemented)

	{
		max: Number [default: 9007199254740992],
		min: Number [default: -9007199254740992]
	}

Handles a number with a decimal mark. Allows thousands separators.

####`number` (not yet implemented)
	
	{
		max: Number [default: 9007199254740992],
		min: Number [default: -9007199254740992]
	}

	Shortcut for

	{
		type: 'choice'
		children: [
			{
				type: 'integer',
				max: '@max', min: '@min'
			}, {
				type: 'float',
				max: '@max', min: '@min'
			}
		]
	}

####`date`

	{
		earliest: Date || Number [default: April 20th, 271821 BCE],
		lastest: Date || Number [default: September 13th, 275760 CE]
	}

Handles a text representation of a date. The exact phrases that it accepts depends upon the language, but most constructs should be supported. For `earliest` and `latest`, the `Date` value is taken to mean an absolute date (the time portion is ignored), and a `Number` value is taken to mean a number of milliseconds away from right now. This relative date can be negative.

####`time` (not yet implemented)

	{
		earliest: Date || Number [default: 00:00:00],
		lastest: Date || Number [default: 23:59:59]
	}

Handles a text representation of a time. The exact phrases that it accepts depends upon the language, but most constructs should be supported. For `earliest` and `latest`, the `Date` value is taken to mean an absolute time (the date portion is ignored), and a `Number` value is taken to mean a number of milliseconds away from right now (looping at midnight). This relative date can be negative.

####`datetime` (not yet implemented)

	{
		earliest: Date || Number [default: April 20th, 271821 BCE, 00:00:00],
		lastest: Date || Number [default: September 13th, 275760 CE, 23:59:00]
	}

Handles a text representation of a time. The exact phrases that it accepts depends upon the language, but most constructs should be supported. For `earliest` and `latest`, the `Date` value is taken to mean an absolute time, and a `Number` value is taken to mean a number of milliseconds away from right now. This relative date can be negative.

###Computed Elements

####`list`

`list` is used in instances where the available options are dynamic. It can be thought of as a `choice` full of a dynamic number of `literal`s. For example, you would use this if a user must enter the name of a Product, and the list of Products is pulled from a web service.

	{
		collect: String (Function(done)),
		refresh: String ('initialize', 'parse') [default: 'initialize']
	}

`compute` must be the name of a function that accepts a single argument. That argument is a callback that accepts 2 arguments, an `error` if one occurred, or a `List` of `suggestion`:

	[{
		display: String
		value: String
	}]

The `collect` function will be called the first time the `list` is called upon, and the returned `List` of `suggestion`s will be used for every evaulation.

The `refresh` property governs how often `collect` is called - either immediately when it is passed into `understand` (`initialize`), or every time `Parser.parse` is called (`parse`). `initialize` should be used for data that should stay constant for the duration of the `Parser` lifespan, and `parse` should be used for data that changes more quickly. If you need to compute data within a single parse, you need to use `value`.

####`suggester`

`suggester` is used in instances where every input is acceptable, but it may be helpful to suggest more. It can be thought of as a `freetext` with opinions. It works much like Google Suggest - you can enter any query, but it suggests queries based upon your input.

	{
		suggest: String (Function(inputString, done))
	}

`suggest` must be the name of a function that accepts a single argument. That argument is a callback that accepts 2 arguments, an `Error` if one occurred, or a `List` of `String`, representing every suggestion. The value is always identical to the parsed string.

`suggest` will be called every time the `suggester` is presented with new input string.

####`validator`

`validator` is used in instances where input can be either accepted or rejected, but no suggestions need to be made.

	{
		validate: String (function(inputString, done))
	}

`validate` must be the name of a function in the scope that accepts a single argument. That argument is a callback that accepts 2 arguments, an `Error` if one ocurred, and a `Boolean` representing if the input is valid or not.

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


