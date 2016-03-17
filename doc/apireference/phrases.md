# Built-in Phrases

There is nothing magical about any of these phrases. All of them
are implemented using the same public API available to custom phrases.

All phrases can take the following props:

  - `score: Number` - set to the `score` property of the output `Option`.
  Higher numbers sort higher. Defaults to `1`. 
  - `qualifiers: Array<String>` - set to the `qualifiers` property of output `Option`.
  - `value: Any` - set to the `result` property of the output `Option`.

## `literal`

Matches or suggests a single literal string.

### Props

- `text`: `String` - The string to accept as input.
- `fuzzy`: `Boolean` - whether or not to use fuzzy matching for this `literal`. Note that fuzzy matching should rarely be used for literals - if you want to fuzzy match many items, use a [`list`](#list).
- `decorate`: `Boolean` - if `true`, then suggest `text` even if it does not match the input. Useful for displaying implicit information.
- `allowInput`: `Boolean` - if `true`, then force decoration, and do not consume any input even if exists. Only applies with `decorate`.
- `category`: `String` - a category to output to the `words` object. Useful for syntax highlighting.

### Example

```js
parser.grammar = <literal
  text='Lacona'
  value='http://lacona.io'
  category='website' />
parser.parseArray('Lac')
/* [
  {
    words: [
      {text: 'Lac', category: 'website', input: true},
      {text: 'ona', category: 'website' input: false}
    ],
    score: 1,
    result: 'http://lacona.io'
  }
] */
```

## `choice`

Branches the parsing logic. Consumes no characters.

## Result

`Any` - One of the following items:

- If the child has an `id` prop, the result will be
  an `Object` of the form `{[childId]: childResult}`
- Otherwise, the `result` of the child for this branch

## Score

The score of the child for this branch.

### Props

- children - The `choice` can contain any number of child elements.
  Each child represents a separate branch that the parse can flow through.
- `limit`: `Integer` - If `<limit>` children are parsed successfully
  (all the way to the end of the parse chain), then stop attempting to parse
  further children. This is very useful in situations where some children are
  synonymous, and there is no need suggest multiples.

### Example

```js
parser.grammar = (
  <choice limit={2}>
    <literal text='Google' value='http://google.com' />
    <literal text='Gmail' value='http://mail.google.com' />
    <literal text='Google Maps' value='http://maps.google.com' />
    <literal text='Google Drive' value='http://drive.google.com' />
  </choice>
)
parser.parseArray('Goog')
/* [
  {
    words: [
      {text: 'Goo', input: true},
      {text: 'gle', input: false}
    ],
    score: 1,
    result: 'http://google.com'
  },
  {
    words: [
      {text: 'Goo', input: true},
      {text: 'gle Maps', input: false}
    ],
    score: 1,
    result: 'http://maps.google.com'
  }
] */
```

## `sequence`

Parses its children in order, one after the other.

### Optional

Every child of a `sequence` can set a property called `optional`.
If it is `true`, It results in an implicit branch in the parse chain.

If `optional` is set, the child can choose to set the props
`limited` and `preferred`, which effect the output. All of these props are
simply shorthand expressions, which map to `choice`s under the covers.
All 3 props default to `false`. Here is how they are mapped:

##### `optional`

```js
  <sequence>
    <literal text='Google' />
    <literal text=' Maps' optional />
  </sequence>

  // becomes

  <sequence>
    <literal text='Google' />
    <choice>
      <literal text='' />
      <literal text=' Maps' />
    </choice>
  </sequence>
```

##### `optional preferred`

Note the orders of the resulting `choice`'s children.

```js
  <sequence>
    <literal text='Google' />
    <literal text=' Maps' optional preferred />
  </sequence>

  // becomes

  <sequence>
    <literal text='Google' />
    <choice>
      <literal text=' Maps' />
      <literal text='' />
    </choice>
  </sequence>
```

##### `optional limited`

Note the `limit` of the resulting `choice`. This is an easy way to say
"accept this child if it's there, but don't suggest it."

```js
  <sequence>
    <literal text='Google' />
    <literal text=' Maps' optional limited />
  </sequence>

  // becomes

  <sequence>
    <literal text='Google' />
    <choice limit={1}>
      <literal text='' />
      <literal text=' Maps' />
    </choice>
  </sequence>
```


##### `optional preferred limited`

This is an easy way to say "accept this child if it's there,
but don't suggest its absence."

```js
  <sequence>
    <literal text='Google' />
    <literal text=' Maps' optional preferred limited />
  </sequence>

  // becomes

  <sequence>
    <literal text='Google' />
    <choice limit={1}>
      <literal text=' Maps' />
      <literal text='' />
    </choice>
  </sequence>
```

There is another piece of functionality known as the `ellipsis`.
If you sent a `<sequence />`s child to have `ellipsis={true}`, then
it means "it is OK to stop here - make the rest of the sequence optional".
This limits the options displayed to the user and can substantially improve
understanding and performance. These two descriptions are precisely equivalent:

```js
<sequence>
  <literal text='The ' />
  <literal text='Batman' ellipsis />
  <literal text=' and Robin' />
</literal>

//becomes

<sequence>
  <literal text='The ' />
  <literal text='Batman' />
  <sequence optional limited merge>
    <literal text=' and Robin' />
  </sequence>
</literal>
```

### Result

`Any` - One of the following items

- the contents of the `value` prop
- if there is no `value` prop, an `Object` that is composed of
  the results of the children:
    - If the child has an `id` prop, the resulting `Object` will
      have a key `{[childId]: childResult}`
    - If the child has the prop `merge`, the child's result will be
      merged into the resulting `Object` using `_.merge`.

### Score

The score of all parsed children, multiplied together.

### Props

- children - The `sequence` can contain any number of child elements.
  Each child will be parsed in order. See the `optional` section
  for more information.
- `unique`: `Boolean` - If `true`, the sequence will check the `id` prop
  of each child before parsing. If the child's `id` prop is already in the
  `result` object (from an child earlier in the chain), it will be skipped.
  Useful with `optional` children.

### Example

```js
parser.grammar = (
  <sequence>
    <literal text='Google' value='google' id='base' />
    <literal text=' Maps' value='maps' id='sub' score={0.5} optional />
    <literal text=' rocks!' />
  </sequence>
)
parser.parseArray('Goog')
/* [
  {
    words: [
      {text: 'Goo', input: true},
      {text: 'gle', input: false},
      {text: ' rocks!', input: false}
    ],
    score: 1,
    result: {base: 'google'}
  }, {
    words: [
      {text: 'Goo', input: true},
      {text: 'gle', input: false},
      {text: ' Maps', input: false},
      {text: ' rocks!', input: false}
    ],
    score: 0.5,
    result: {base: 'google', sub: 'maps'}
  }
] */
```

## `repeat`

Allows an element to be repeated multiple times, with an optional separator.

### Result

`Array` - An array of the values of each child, in the order they were parsed

### Score

`1`

### Props

- `separator`: `LaconaElement` - A single element, which will be placed
  in sequence between every repetition. Its result is ignored.
- `unique`: `Boolean` - If `true`, the `repeat` will not allow repetitions
  that have the same `result`. That is to say, the `repeat`'s `result` is
  guaranteed to be `unique`.
- `max`: `Integer` - the maximum number of repetitions to allow. Defaults
  to unlimited.
- `min`: `Integer` - the minimum number of repetitions to allow. Defaults to 1.

### Example

```js
parser.grammar = (
  <repeat separator={<literal text=' '/>} max={3}>
    <literal text='wort' value='go' />
  </repeat>
)
parser.parseArray('wort wort')
/* [
  {
    words: [
      {text: 'wort', input: true},
      {text: ' ', input: true},
      {text: 'wort', input: true}
    ],
    score: 1,
    result: ['go', 'go']
  }, {
    words: [
      {text: 'wort', input: true},
      {text: ' ', input: true},
      {text: 'wort', input: true},
      {text: ' ', input: false},
      {text: 'wort', input: false}
    ],
    score: 1,
    result: ['go', 'go', 'go']
  }
] */
```

## `label`

Used to provide additional metadata for within a grammar. This provides users
with hints to the available options in the flexible way. This also improves
performance by limiting the number of parse branches.

### Score

`label`s that suppress input have a very low score, to ensure that
completed suggestions appear before incomplete ones.

### Props

- `text`: `String` - this text is used as the `argument` name and
  the `suppress` placeholder, if either is `true`
- `argument`: `Boolean` - defaults to `true`. If `true`, all words
  that come from this parse segment will contain an `argument` property,
  which will equal the `text` of this `label`. Note that currently only the
  first `<label argument />` in the chain is exported.
- `suppress`: `Boolean` - defaults to `true`. If `true`, parses that have
  consumed the entire input string will not continue into this `label`'s
  `child`. Instead, it will output a word with
  `{text: <text>, placeholder: true}` This improves performance and
  usability, as it limits the amount of suggestions that are output
  for an incomplete input.
- `suppressEmpty`: `Boolean` - defaults to `false`. If `true`,
  this `label` will also suppress inputs that are an empty string.
  That is to say, if the preceding elements consume the entire input
  string but have not yet made any suggestions, this label will still
  suppress the input.
- `suppressWhen`: `(input: String) => Boolean` - When this label is parsed,
  it will call this function. If it returns `true`, this label will suppress
  the input (returning a `placeholder`), even if the input is non-null. This
  is useful to describe incomplete but non-suggestable input.
    - For example, imagine a phrase is designed to accept a 3-digit integer,
      but the user has only entered a single digit. The input is not yet valid,
      and it does not make sense to suggest a completion, but it also needs to
      show the user that they are on their way to a valid input. In this case,
      it makes sense to use something like
      `suppressWhen={(input) => /^\d{1,2}$/.test(input)}`.

## `freetext`

Accept arbitrary input. Note that this phrase contains significant
implicit branching, as it will attempt to validate and parse every
substring between `substr(0, 1)` and `substr(0)`. Use the `splitOn` and
`limit` properties to improve performance.

### Result

`String` - the substring that was validated and parsed.

### Score

Higher scores are given to
shorter substrings. Therefore, the highest-scored parse chain will be
the one in which the freetext consumed the fewest characters.

### Props

- `splitOn`: `String | RegExp` - Argument to `String::split` to determine
  which substrings to attempt parsing.
- `consumeAll`: `Boolean` - Do not attempt to parse substrings, only parse
  the entire remaining string. Improves performance if the `freetext` is
  the final phrase in a command
- `filter`: `Function(input: String) => Boolean` - Better-performing
  shorthand for `<filter function={filter}><freetext ...otherProps /></filter>`.
- `limit`: `Integer` - If `<limit>` substrings are parsed successfully
  (all the way to the end of the parse chain), then stop attempting
  to parse further substrings.

## `filter`

Filter options with an arbitrary function.

### Props

- `inbound: (option: Option) => Boolean` -
  If it returns false, children will not be parsed
- `outbound: (option: Option) => Boolean` -
  Called for each child output option. If it returns true, it will not
  output that option.
- `skipIncomplete: Boolean` - if true, `outbound` will not be called if
  the output option contains a placeholder

### Example

```js
parser.grammar = (
  <filter outbound={(option) => _.isString(option.result)}>
    <list items={[
      {text: 'some string', value: 'string'},
      {text: 'some object', value: {key: 'value'}}
    ]} />
  </filter>
)
parser.parseArray('some ')
/* [{
  words: [
    {text: 'some ', input: true},
    {text: 'string', input: false}
  ],
  score: 1,
  result: 'string'
}] */
```

## `map`

Modify options with an arbitrary function.

### Props

- `inbound: (option: Option) => Option` - Changes an option before parsing
  children
- `outbound: (option: Option) => (Option | Iterable<Option>)` - Changes the
  output options after parsing children. If it returns an Iterable, all
  options will be output
- `limit: Number` - Limits output if `outbound` returns an Iterable
- `skipIncomplete: Boolean` - if true, `outbound` will not be called if
  the output option contains a placeholder

### Example

```js
parser.grammar = (
  <map outbound={(option) => _.merge({}, option, {result: 'test'})}>
    <literal text='lacona' value='lacona' />
  </repeat>
)
parser.parseArray('lac')
/* [{
  words: [
    {text: 'lac', input: true},
    {text: 'ona', input: false}
  ],
  score: 1,
  result: 'test'
}] */
```

## `tap`

Does not effect parsing at all. Calls a function if the parse reaches
it, and continues parsing. Useful for debugging, or interacting with
the outside world based upon parsing.

### Props

- `inbound` - `Function(input: String)` - called everytime this element
  is visited
- `outbound` - `Function(input: String)` - called everytime this element's
  child outputs an option

### Example

```js
parser.grammar = (
  <tap outbound={console.log}>
    <literal text='lacona' />
  </repeat>
)
parser.parseArray('lac')
/* logs: {text: null, words: [...], ...} */
```

## `list`

Logically, a `list` can be thought of as a `choice` of `literal`s.
However, it has enhancements that allow it to work better for large lists,
especially when limiting and fuzzy matching is used. It also performs better.

In general, everytime you have a `choice` containing only `literal`s,
you should use a `list` instead. If you have a `choice` that is has a
`limit` whose children are `literal`s with `fuzzy`, you *must* use
`list`, or the output may be incorrect.

### Result

`Any` - The `value` of the `item`, or `undefined`

### Props

- `items`: `Array<{String | Object}>` - An array valid items.
  The parse will branch for each one. If `item` is a `String`, it
  is equivalent to `{text: item}`. Each `item` is an `Object` with
  these properties:
    - `text`: `String` - The text to parse
    - `value`: `Any` - The `list`'s result in this parse branch
    - `qualifier`: `String`
- `fuzzy`: `Boolean` - If `true`, the `items` will be fuzzy matched.
- `limit`: `Integer` - If `<limit>` `items` are parsed successfully
  (all the way to the end of the parse chain), then stop attempting to
  parse further children. Note that if `fuzzy` is `true`, then fuzzy
  sorting is applied *before* limiting, so the best matches will not be limited.

### Example

```js
parser.grammar = <list limit={2} items={[
  {text: 'Google', value: 'http://google.com'},
  {text: 'Gmail', value: 'http://mail.google.com'},
  {text: 'Google Maps', value: 'http://maps.google.com'},
  {text: 'Google Drive', value: 'http://drive.google.com'}
]} />
parser.parseArray('gm')
/* [
  {
    words: [
      {text: 'Gm', input: true},
      {text: 'ail', input: false}
    ],
    score: 1,
    result: 'http://mail.google.com'
  },
  {
    words: [
      {text: 'Goo', input: true},
      {text: 'gle Maps', input: false}
    ],
    score: 1,
    result: 'http://maps.google.com'
  }
] */
```

## `raw`

The lowest-level phrase, which allows completely arbitrary manipulation of outputs. See tests for examples, but only use as a last resort.
