# Phrases

In elliptical, natural language is modeled using `Phrases`. This allows
you to model language in an extensible, composable, dynamic way. At its most
basic level, a `Component` is just an object that has a single function
called `describe`.

```jsx
const Exclamation = {
  describe() {
    return <literal text='elliptical rocks!' />
  }
}
```

`describe` returns an `element`.

## Parsing Components

Once we have a `Component`, we can use it in `element`s of our own.

```jsx
createParser(<Exclamation />).parse('') // => 'elliptical rocks!'
```

## Props

We can also set `props` on our elements. The element itself is exposed
as the first argument to `describe`. Here we access `props` using ES2015
argument destructuring.

```jsx
const Exclamation = {
  describe({props}) {
    return <literal text={`${props.app} rocks!`} />
  }
}
createParser(<Exclamation app='Lacona' />).parse('') // => 'Lacona rocks!'
```

## Children

`describe` is also passed its `children` as an Array. We can use this
to build "Higher-order Phrases" - that is, `Component`s that take
`elements` and augment them.

```jsx
const Exclamation = {
  describe({children}) {
    return (
      <sequence>
        {children[0]}
        <literal text=' rocks!' />
      </sequence>
    )
  }
}

const grammar = <Exclamation><literal text='Batman' /></Exclamation>
createParser(grammar).parse('') // => 'Batman rocks!'
```

## defaultProps

We don't want consumers of our Phrase to need to specify every `prop` every
time, so we can use the `defaultProps` helper.
It is an object that is  always merged onto the
provided `props` using [`_.defaults`](https://lodash.com/docs#defaults).

```jsx
const Exclamation = {
  defaultProps: {app: 'Google Chrome'},
  describe({props}) {
    return <literal text={`${props.app} rocks!`} />
  }
}

createParser(<Exclamation />).parse('') // => 'Google Chrome rocks!'
```

## Result Helpers

Every Phrase can have two functions, `mapResult` and `filterResult`, which can be used
to modify phrase behavior based upon their `result` in a simple, imperative way.

These these methods are only called if the phrase is *complete* - that is,
if any `Word`s with `placeholder: true` are in the `words`. Therefore,
they do not need to worry about errors because of partial results.

If both are declared, `mapResult` runs *before* `filterResult`.

These functions do not allow for any functionality that `<map>` and `<filter>`
do not already provide, but they are a simpler, more declarative approach.
Additionally, elliptical addons can make use of them easily.

### `mapResult`

```js
mapResult: (result: Any, element: Element) => Any
```

The return value of this call will set as the `result` from this phrase. 
This should be used sparingly, only when the element structure returns
data in the wrong format.

If you need to do validation on *incomplete* outputs, use `<map>`.

Unlike `<map>`, `mapResult` cannot return an iterable and cannot be limited.

### `filterResult`

```js
filterResult: (result: Any, element: Element) => Boolean
```

If this function returns `false`, this branch will not continue parsing.
This should be used agressively to ensure that invalid outputs never make
it past the phrase.

If you need to do validation on *incomplete* outputs, use `<filter>`.
