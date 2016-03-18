# Fuzzy Matching

Elliptical is all about matching strings. This is primarily done through the
`<literal>` and `<list>` phrases. However, string matching is not a simple
task. Elliptical has 4 different string matching strategies, which can be used
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

## Start

The simplest matching style, meaning that the `input` and the `text` are
the same from the beginning of the string.

```
text: 'superman'
input: 'super'

words: [
  {text: 'super', input: true},
  {text: 'man', input: false}
]
```

The `score` from such a match will always be 1.

## Contain

The `input` is found, in its entirety, somewhere in the `text`, though not
necessarily starting at the beginning.

```
text: 'superman'
input: 'man'

words: [
  {text: 'super', input: false}
  {text: 'man' : input: true}
]
```

The score this match will be relative to how close to the beginning
of the `text` the `input` occurs. Matching at the beginning of the string will
result in a score of 1, just like `start` matching. Matching at the end will
result in a lower score.

## Fuzzy

This means that every character in the `input` is in the `text`, in order,
though perhaps with an arbitrary amount of extra characters in between.
This matching style was popularized with the Sublime Text Command Palette
and provides a powerful and performant way to search long inputs.

```
text: 'It was a dark and stormy night'
input: 'darkstor'

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
If the match is interrupted,
the score will be related to the number of contiguous characters and their
proximity to whitespace (if it exists).

For example: if we parse this list with input: `gc`:

```jsx
<list items={['Google Chrome', 'gcc compiling', 'Ingsoc', 'My GCC']} />
```

The outputs will be scored in this order:

```
- gcc compiling // start
- My GCC        // contain
- Google Chrome // acronym
- Ingsoc        // fuzzy
```
