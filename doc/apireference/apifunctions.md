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

If a `processor` function is provided, it will call it for each Element
in the tree, and compile the returned Element instead.

```js
compile: (
  grammar: Element<Phrase>,
  processor?: (element: Element) => Element
) => ((input: String) => Array<Option>)
```

## `combineProcessors`

Combines any number of processors. They will be applied in order to each
element compiled.

```js
combineProcessors: (
  processor: (element: Element) => Element,
  ...
) => (element: Element) => Element
```