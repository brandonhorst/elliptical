# API Functions

## `createElement`

Returns an `Element`. For use in `describe` calls, and to
create grammars to pass to `compile`. This function
matches the JSX signature. Strings passed to the `type` parameter will be
automatically dereferenced with the built-in commands.

```js
createElement: (
  type : String | Phrase,
  props: Object<Any>,
  children: Array<Element>
) => Element
```

## `compile`

Compiles a `Element` tree and returns a function that traverses the tree.

```js
compile: (
  grammar: Element<Phrase>,
  process: (element: Element) => Element
) => ((input: String) => Array<Option>)
```
