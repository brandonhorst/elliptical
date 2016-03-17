# Language Elements

In elliptical, language is modeled through `element`s. An `element` is just a plain
old Javascript object. It looks like this:

```js
{
  type: Exclamation,
  props: {value: 'awesome'},
  children: [element1, element2]
}
```

Its properties are:

- `type` - a `Phrase` that determines the behavior of the element
- `props` - an arbitrary `Object` that can be used by the `type`
- `children` - an `Array` of `elements` that are owned by this `element`

## createElement

`element`s are the primary way to describe language in elliptical, so to help
you create them, elliptical contains a function to build them for you,
called `createElement`.

```js
import {createElement} from 'elliptical'

createElement(
  Exclamation, // Phrase
  {value: 'awesome'}, // props
  element('literal', {text: 'elliptical'}), // first child
  element('literal', {text: 'lacona'}) // second child...
)
```

## Built-in Phrases

Elliptical ships with a bunch of useful phrases built-in. You can access
them by passing a `String` as the first argument, rather than a `Phrase`.

```js
import {createElement} from 'elliptical'

createElement(
  'literal', // phrase name (lowercase)
  {text: 'elliptical'} // props
)
```

## Using JSX

This happens to coincide with the signature used by `JSX`, so if you're
willing to use a compiler like [Babel](https://babeljs.io/), you can use
this friendly syntax:

```jsx
/** @jsx createElement */
import {createElement} from 'elliptical'

<choice value='literal'>
  <literal text='elliptical' />
  <literal text='lacona' />
</choice>
```

You never need to use JSX, but it does make for a cleaner syntax.

Because `element` is a pure function, you can safely wrap it in a function
of your own. You may want to use this to provide additional "built-in"
`element`s, or add features.