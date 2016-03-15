

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