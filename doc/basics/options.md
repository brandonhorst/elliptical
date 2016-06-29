# Options

When elliptical is traversing a `Component` tree, it does so using `option`s.
These `option`s are what is ultimately returned by a parse.

An `option` is just a plain Javascript object. It looks something like this:

```js
{
  text: null,
  words: [
    {text: 'elliptical ', input: true},
    {text: 'r', input: true},
    {text: 'ocks', input: false}
  ],
  result: {library: 'elliptical'},
  score: 1,
  qualifiers: [],
  annotations: [{value: 'https://elliptical.laconalabs.com', start: 0, end: 1}],
  categories: [{value: 'verb', start: 1, end: 2}],
  arguments: []
}
```

Here's what that all means:

- `text : String | null` - the unparsed text at this point in the tree.
A `null` value means that we have not only parsed all of the text, but we
have begun making suggestions future inputs.
- `words : Array<Word>` - objects representing input that has
already been parsed. Used to display an interface to the user.
- `results: Any` - an arbitrary object that represents the parsed input
in a logical way. Used to do something based upon the input.
- `score : Number` - used for sorting outputs.
- `qualifiers: Array<Any>` - used for distinguishing between outputs
with similar `words`.
- `annotations: Array<Any>` - optional data associated with words that is not
required for comprehension
- `categories: Array<Any>` - arbitrary (non-semantic) data associated with words
- `arguments: Array<Any>` - arbitrary semantic data associated with words
