# Qualifiers

Occassionally, two equivalent lingusitic expressions could have an identical
meaning. In conversation, context can often be used to know the intended
meaning, but that is not always possible when giving commands to elliptical.
That is the problem that qualifiers solve.

You may set the `qualifiers` prop on any element, or on the items of a `<list>`.
It must be an Array of Strings.

## Example

I want to create a grammar to allow
me to send a text message to a contact. Perhaps something like this:

```js
<sequence>
  <literal text='text ' />
  <Contact id='contact' />
  <literal text=' ' />
  <freetext consumeAll id='message' />
</sequence>
```

For convenience, I want the `<Contact>` phrase to support specifying a contact
by full name, or just by first name, so I can say "text Mary hey what's up?"

Now, imagine the user has two friends named Mary.
This will result in two idential outputs:

```
text Mary hey what's up?
text Mary hey what's up?
```

Not very useful. This is where qualifiers come in. We can build our
`<Contact>` phrase with this grammar:

```jsx
<list items={[
  {text: 'Mary', value: 'Mary Anderson', qualifiers: ['Anderson']},
  {text: 'Mary', value: 'Mary Ethel', qualifiers: ['Ethel']},
  {text: 'Mary Anderson', value: 'Mary Anderson'},
  {text: 'Mary Ethel', value: 'Mary Ethel'}
]} />
```

Now, the user can fully specify their name (and no qualifiers will be emitted).
However, if the user only enters the first name ("text Mary hey what's up"),
qualifiers will be emitted.

```js
[{
  words: [
    {text: 'text ', input: true},
    {text: 'Mary', input: true},
    {text: ' ', input: true},
    {text: "hey what's up?", input: true}
  ],
  qualifiers: 'Anderson',
  result: 'Mary Anderson'
}, {
  words: [
    {text: 'text ', input: true},
    {text: 'Mary', input: true},
    {text: ' ', input: true},
    {text: "hey what's up?", input: true}
  ],
  qualifiers: 'Ethel',
  result: 'Mary Ethel'
}
```

Then, when building our interface, we could present this information to
the user directly, perhaps like so:

- text Mary hey what's up *(Anderson)*
- text Mary hey what's up *(Ethel)*
