# Components

In tarse, natural language is modeled using `Components`. This allows
you to model language in an extensible, composable, dynamic way. At its most
basic level, a `Component` is just an object that has a single function
called `describe`.

```jsx
const Exclamation = {
  describe() {
    return <literal text='tarse rocks!' />
  }
}
```

`describe` returns an `element`. Once we have a `Component`, we can use it
in `element`s of our own.

```jsx
createParser(<Exclamation />).parse('') // => 'tarse rocks!'
```

We can also set `attributes` on our `Components`, which are exposed
`describe` as `props`.

```jsx
const Exclamation = {
  describe({props}) {
    return <literal text={`${props.app} rocks!`} />
  }
}
createParser(<Exclamation app='Lacona' />).parse('') // => 'Lacona rocks!'
```

We can use the powers of
[ES2015 Destructuring](http://www.2ality.com/2015/01/es6-destructuring.html)
to set default values for our `props`.

```jsx
const Exclamation = {
  describe({props: {app, punctuation = '!!!'}}) {
    return <literal text={`${app} rocks${punctuation}`} />
  }
}
createParser(<Exclamation app='Lacona' />).parse('') // => 'Lacona rocks!!!'
```

`describe` is also passed its `children` as an Array. We can use this
to build "Higher-order Components" - that is, `Component`s that take
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