# Types

## `Element`

```js
{
  type: Component|Source,
  attributes: Object<Any>,
  children: Array<Element>
}
```

## `Component`

```js
{
  observe?: ({
    props: Object<Any>,
    children: Array<Element>
  }) => Element<Source>,
  describe?: ({
    props: Object<Any>,
    children: Array<Element>,
    data: Any
  }) => Element<Component>,
  traverse?: (
    option: Option,
    {
      props: Object<Any>,
      children: Array<Element>, // each Element also has a `traverse` function
      data: Any,
      next: (Option, Element<Component>) => Iterable<Option>
      register: (Element<Source>) => Any
    }
  )
}
```

`Component`s must have either a `describe` or a `traverse` function.

## `Option`

An object representing the current state of parse tree traversal. Each
component in the tree will create a new `Option` based upon the `Option`
passed to it.

Components may add properties when traversing the tree. They should remove
them when their traverse is outbound, so as not to pollute the object.
Ensure that these properties are unique to avoid name conflicts.

You must not mutate this object.

```js
{
  text: String,
  words: Array<Word>,
  result: Any,
  score: Number,
  qualifiers: Array<String>
}
```

## `Word`

```js
{
  text: String,
  input: Boolean,
  argument?: String,
  placeholder?: Boolean,
  category?: String
}
```

## `Store`

```js
{
  register: (Element<Source>) => Any,
  values: Observable<{
    element: Element,
    value: Any
  }>
}
```

## `Parser`

```js
{
  parse: (String) => Array<Option>,
  watch: (String) => Observable<Array<Option>>,
  store: Store
}
```

If you are creating a static parse, use `parse`, which will
simply return an Array of `Option`s. If some of your components
contain `observe` functions, you should use `watch`, which will return
an observable which will send a new Array of `Option`s whenever
the data changes.