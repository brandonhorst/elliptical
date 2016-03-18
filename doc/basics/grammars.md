# Grammars

In elliptical, language is modeled as a tree of `Phrase`s. That may sound
scary but it's really not. Take a look at this grammar:

```jsx
const grammar = (
  <sequence>
    <literal text="I'm " />
    <choice>
      <literal text='Superman' />
      <literal text='Batman' />
    </choice>
  </sequence>
)
```

It's not too hard to figure out, right? If you think of it as a tree,
you can see that there are two "branches":

- "I'm Superman"
- "I'm Batman"

You've just met 3 built-in phrases:

- `sequence` says "these Phrases must occur one-after-the-other."
- `choice` says "any of these Phrases works" - it creates a "branch"
in the tree.
- `literal` matches a literal string, as defined in the `text` attribute.

## Parsing Grammars

To parse a grammar, we first have to compile it. We do this
with the `compile` function. It takes
a grammar and returns an object with a `parse` method. Let's try to parse
the string "i'm bat".

```js
const parse = compile(grammar)
const outputs = parse("i'm bat")
```

The results are contained in `outputs`. It is an array of `option` objects.
It looks something like this:

```js
[{
  words: [
    {text: "I'm ", input: true},
    {text: 'Bat', input: true},
    {text: 'man', input: false}
  ],
  results: {},
  score: 1,
  qualifiers: []
}]
```

## Words

The `words` property shows us a representation elliptical's understanding of the
input. Note that the case has been fixed, and it is suggesting the string
`"man"` as a completion to the input. Each `word` also contains an
`input` property, which tells us whether it was a part of the original input,
or whether it is a suggestion. This can be used to present a nice
interface for the user. Perhaps it would look something like this:

> **I'm Bat**man

## Results

However, we want to be able to do something with the input beyond just
displaying it. To do that, we should use the `results` property.
Note that in our example above, `results` is an empty Object. We can fix this
by adding some attributes to our grammar.

```js
const grammar = (
  <sequence>
    <literal text="I'm " />
    <choice id='name'>
      <literal text='Superman' value='Clark Kent' />
      <literal text='Batman' value='Bruce Wayne' />
    </choice>
  </sequence>
)
```

We have added the `id` attribute to our `<choice>`. `id` is used by
children of the `<sequence>` phrase, and it determines the key in
the `results` Object. We have added `value` attributes to our `<literal>`s,
which will serve as the values for our `results` Object. If we parse
this new grammar, we get information in the `outputs`:

```js
[{
  ...
  results: {name: 'Bruce Wayne'}
  ...
}]
```

Now we can take these results and do something with them.

## Phrases

There are many more built-in `Phrase`s, and you can add custom
`Phrase`s to model any language constructs imaginable.

Elliptical makes no assumptions about language - it processes
raw unicode strings. Grammars can be constructed in any language.