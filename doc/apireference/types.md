# Types

## `Element`

```js
{
  type: Phrase | String,
  props: Object<Any>,
  children: Array<Element>
}
```

## `Phrase`

```js
{
  defaultProps?: Object<Any>,
  filterResult?: (result: Any, element: Element) => Boolean,
  mapResult?: (result: Any, element: Element) => Any,
  describe?: (element: Element) => Element,
  visit?: (option: Option, element: Element) => Iterable<Option>
}
```

`Phrase`s must have either a `describe` or a `visit` function.

## `Option`

An object representing the current state of parse tree traversal. Each
phrase in the tree will create a new `Option` based upon the `Option`
passed to it.

Phrases may add properties when traversing the tree. They should remove
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
