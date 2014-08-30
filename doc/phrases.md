
#Built-in `phrase`s

##Groups

###`choice`

```
{
	children: [ phraseReference ] //required
	limit: Integer //defaults to 0, no limit
}
```

###`sequence`
```
{
	children : [ phraseReference ] //required
	separator: phraseReference //defaults to ' '
}
```

###`repeat`
```
{
	child: phraseReference, //required
	separator: phraseReference //defaults to ' '
}
```

##Elements

###`value`

The `value` phrase allows you define how your element is parsed with code. This is sometimes necessary but makes maintainability and translation very difficult. Please avoid using it wherever possible - it removes all of the benefit of using `lacona`.

```
{
	compute: String //required. Refers to scope Function(inputString, data, done)
}
```

`compute` must be the name of a function stored in the `scope` that accepts 3 arguments. `inputString` is all of the currently un-parsed text. `data` is a callback that accepts a single argument, `suggestion`:

```
{
	display: String
	value: String
}
```

`display` is the actual piece of `inputString` that should be handled by this `value`, and `value` is the object that should be added to the `result`. `data` can be called any number of times, but should only be called once per `suggestion`. `done` accepts an `Error` argument if an error occurred, or nothing. `data` should never be called after `done` has been called.

###`literal`

	{
		display: String, //required
		value: String
	}

Handles a single literal string `display`, and results in the value `value`.

Technically, `literal` is just a standard phrase, like any other, implemented with a single `value`, and automatically `understand`'d when a `Parser` is created. Feel free to look at its code.
