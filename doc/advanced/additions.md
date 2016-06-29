# Additions

Elliptical's job is not simply to parse text, but also to add *metadata* to
the output. This additional information can be used to create rich, powerful
interfaces. There are various kinds of metadata, and they are collectively
referred to as Additions.

There are currently 4 kinds of Additions: Categories, Arguments, Qualifiers,
and Annotations. They all work in precisely the same way, but for consistency,
they should be used for specific tasks.

- **Arguments** are strings that identify the *semantic type* of some piece
  of the input. They should be used to mark *what something is*.
- **Categories** are strings that identify the *grammatical type* of some piece
  of the input. These should be used to mark parts of speech, punctuation, or
  other components for the purpose of syntax highlighting. They do not provide
  any semantic meaning.
- **Qualifiers** are strings that should remove ambiguity between
  identical strings that fall within the same Argument,
  but which ultimately refer to different
  things. One example would be the input `call John`. If you know multiple
  people named John, this sentence is ambiguous. The surname could be used
  as a qualifier, to distinguish between them.
- **Annotations** are strings that provide additional optional information
  about a given input. They are not required to grasp the meaning of the
  output. They could to display tooltips, related links,
  or identifying inline images.

## Using Additions

All `Element`s can be passed any of these additions as props. All elements
accept the plural form of the addition as an array, or the singular form as
a string.

```jsx
<sequence>
  <literal text='call ' category='action' />
  <choice argument='contact'>
    <literal
      text='John'
      qualifiers={['Smith', 'from work']}
      annotation='@realjohnsmith' />
    <literal
      text='John'
      qualifier='Doe'
      annotations={['@whoisjohndoe', 'http://johndoe.com']} />
  </choice>
</sequence>
```

Note that `arguments` should be most often used alongside the `<placeholder>`
element, but do not need to be.

Because of this `<placeholder>` has a small shorthand. If the `argument`
prop is provided and the `text` prop is not, the `argument` prop will
be used for both the `argument` and the `text.

```jsx
// These two elements are precisely equivalent
<placeholder argument='companion' />
<placeholder argument='companion' text='companion' />
```

