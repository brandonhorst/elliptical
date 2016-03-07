# API Functions

## `createElement`

Returns an `Element`. For use in `describe` or `observe` calls, and to
create grammars to pass to `compile` and `createParser`. This function
matches the JSX signature. Strings passed to the `type` parameter will be
automatically dereferenced with the built-in commands.

```
createElement: (
  type : String | Component | Source,
  attributes: Object<Any>,
  children: Array<Element>
) => Element<Component|Source>
```

## `createOption`

Returns an `Option`. If you are using `createParser`, you should not need
to use this method directly, as the initial `Option` is created for you
automatically.

```
createOption: (attrs: Object<Any>) => Option

`attrs` is combined with the default `option`, using `_.defaults`.

```js
{
  text: '',
  words: [],
  result: undefined,
  score: 1,
  qualifiers: []
}
```

## `compile`

Compiles a `Element` tree and returns a function that traverses the tree.
If you are using `createParser`, you will should not need this function.

```js
compile: (
  grammar: Element<Component>,
  register: (descriptor: Element<Source>) => Any
) => ((option: Option) => Iterable<Option>)

## `createStore`

Creates a `Store`, which is used to store state for `Component`s. If you
are using `createParser`, the `Store` is generated for you.

```js
createStore: () => Store
```

## `createParser`

Convenience function that kickstarts a natural language parser.

``js
createParser: (grammar: Element) => Parser
