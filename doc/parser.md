#Parser

`Parser` is a constructor that takes no arguments. Instantiate a new `Parser` with

```javascript
var parser = new lacona.Parser();
```

##`parser.understand(grammar)`

See [grammar](doc/grammar.md) docs.

Returns the `Parser` instance for chaining.

##`parser.use(middleware)`

Takes a middleware function that will be used to modulate the data coming from Lacona. All middleware `use`d will be executed in order. The most common use for this is to take the data and transform it into something that can be displayed. While this may not be useful on the server or in a framework like AngularJS, it could come in handy for simple sites that want to make use of Lacona's functionality.

`middleware` must be a function that takes 2 arguments, `data` which represents the actual data coming from Lacona (or previous middleware), and a callback `done`. The function is expected to modulate `data` in some way and call `done` with an `Error` or nothing. The next middleware will be called, or the last middleware will call the `data` event handler.

Returns the `Parser` instance for chaining.

###`on(event, handler)`

This allows you to set handlers that respond to the parser's events. Just like node.js streams, `Parser` will trigger 3 events: `data`, `end`, and `error`. To handle one of these events, just pass the name of the event as the first argument, and a `Function` to handle it as the second.

Returns the `Parser` instance for chaining.

####`data` event

This event is triggered as soon as the `Parser` gets a successful parsing structure. It is passed a single argument, `option`, which is a representation of the parse (after being passed through all middleware). These may be called in any order. If order matters, ... #Figure this out#

####`end` event

Called with no arguments when all possible options have been delivered. `data` will never be called after `end` is, for a single parse.

####`error` event

Something went wrong. `end` will not be called.
