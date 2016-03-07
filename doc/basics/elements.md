# Language Elements

In tarse, language is modeled through `element`s. An `element` is just a plain
old Javascript object. It looks like this:

```js
{
  type: Choice,
  attributes: {value: 'awesome'},
  children: [element1, element2]
}
```

Its properties are:

- `type` - a `Component` that determines the behavior of the element
- `attributes` - an arbitrary `Object` that can be used by the `type`
- `children` - an `Array` of `elements` that are owned by this `element`

`element`s are the primary way to describe language in tarse, so to help
you create them, tarse contains a function to build them for you,
also called `element`.

```js
element(
  'choice', //component name
  {value: 'awesome'}, // attributes
  element('literal', {text: 'tarse'}), // first child
  element('literal', {text: 'lacona'}) // second child...
)
```

If you pass a string as the first argument, tarse will look up that string
in the built-in `Component`s. If you pass a `Component` itself,
it will use that.

Here's the signature:

```js
function element(
  type: String | Component,
  attributes: Object<Any>,
  ...children: Element
)
```

// TODO link to JSX
This happens to coincide with the signature used by `JSX`, so if you're
willing to use a compiler like [Babel](https://babeljs.io/), you can use
this friendly syntax:

```jsx
<choice value='literal'>
  <literal text='tarse' />
  <literal text='lacona' />
</choice>
```

You never need to use JSX, but it does make for a cleaner syntax.

Because `element` is a pure function, you can safely wrap it in a function
of your own. You may want to use this to provide additional "built-in"
`element`s, or add features. You can read about this at // TODO link
extensions.