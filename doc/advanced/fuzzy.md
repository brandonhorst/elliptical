# Fuzzy Matching

Elliptical is all about matching strings. This is primarily done through the
`<literal>` and `<list>` phrases. However, string matching is not a simple
task. Elliptical has 3 different string matching strategies, which can be used
for different purposes.

In the context of elliptical, we are concered about matching the `input`
(from the user) with the `text` (from the grammar). Elliptical takes them,
applies the various string matching strategies, and returns a `words`
array.

All string matching is case-insensitive, but punctuation is meaningful.

`<literal>` and `<list>` have prop which govern their matching strategies.

- `strategy: String` - This should be a string, one of `start`, `contain`,
  `acronym`, or `fuzzy`.

Specifying a looser matching strategy will always include the more restrictive
matching strategies.

## Where Fuzzy Matching Happens

In elliptical, fuzzy matching can only take place at the end of the string.
For example, imagine this simple grammar:

```jsx
<sequence>
  <literal text='remind me to ' strategy='fuzzy' />
  <literal text='feed the dog' strategy='fuzzy' />
</sequence>
```

If we compile this grammar and parse `rmt`, we could get the output we expect,
with fuzzy matching the first literal.

```js
[
  {text: 'r', input: true},
  {text: 'e ', input: false},
  {text: 'm', input: true},
  {text: 'ind me  ', input: false},
  {text: 't', input: true},
  {text: 'o  ', input: false},
  {text: 'feed the dog', input: false}
]
```

However, if we try to parse `rmtftd`, we get no output. This is because
anything that we fuzzy match must consume the entire input.

If your application allows for Autocomplete, the user could complete `rmt` and
then type `ftd`, resulting in a full input of `remind me to ftd`, which would
parse correctly.

The primary reason for this limitation is usability. For a
simple grammar like this, fuzzy matching the entire string would be possible.
However, when you are dealing with very complicated grammars (like
[elliptical-datetime](https://github.com/laconalabs/elliptical-datetime)
or grammars that contain the `<freetext>` phrase, lots of behavior arises that
the user does not necessarily expect.

Performance is also impacted dramatically if the fuzzy matching algorithm
is applied to all input.

## Match Strategies

### Start

The simplest matching style, meaning that the `input` and the `text` are
the same from the beginning of the string.

```
const parse = compile(<literal text='superman' strategy='start' />)

parse('super')

...
words: [
  {text: 'super', input: true},
  {text: 'man', input: false}
]
```

The `score` from such a match will always be 1.

### Contain

The `input` is found, in its entirety, somewhere in the `text`, though not
necessarily starting at the beginning.

```
const parse = compile(<literal text='superman' strategy='contain' />)

parse('man')

...
words: [
  {text: 'super', input: false}
  {text: 'man' : input: true}
]
```

The score this match will be relative to how close to the beginning
of the `text` the `input` occurs. Matching at the beginning of the string will
result in a score of 1, just like `start` matching. Matching at the end will
result in a lower score.

### Fuzzy

This means that every character in the `input` is in the `text`, in order,
though perhaps with an arbitrary amount of extra characters in between.
This matching style was popularized with the Sublime Text Command Palette
and provides a powerful and performant way to search long inputs.

```
const parse = compile(
  <literal text='It was a dark and stormy night' strategy='fuzzy' />
)

parse('man')

...
words: [
  {text: 'It was a ', input: false},
  {text: 'dark', input: true},
  {text: ' and ', input: false},
  {text: 'stor', input: true},
  {text: 'my night', input: false}
]
```

The score from this match is complicated. If the `input` exists contiguously
in the `text`, the score will be the same as as a `contains` match.

If the match is interrupted, there are some special cases to improve matching
in whitespace-delimited and case-sensitive languages. It works like this:

- The score will be highest if the match is an "acronym" - that is, each
  character in the input is the first letter of a word in the text
- The score will be next highest if the characters in the input are uppercase
  in the text.
- Otherwise, the score will be relative to the number of contiguous characters
  in the text.

For example: if we parse this list with input: `gc`:

```jsx
<list items={[
  'Google Chrome',
  'gcc compiler',
  'GoComics',
  'Ingsoc',
  'My GCC'
]} strategy='fuzzy' />
```

The outputs will be scored in this order:

```
- gcc compiler  // start
- My GCC        // contain
- Google Chrome // acronym
- GoComics      // capital
- Ingsoc        // fuzzy
```
