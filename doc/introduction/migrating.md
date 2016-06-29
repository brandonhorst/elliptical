#Migrating from `1.0.0-rc15` and earlier

With `1.0.0-rc16`, some major changes were made to `arguments`, `categories`,
and `qualifiers`, to simplify interactions.

- All phrases can now have `arguments`, `categories`, `qualifiers`, or
  `annotations`. They can also use these in the singular form.
- The `<label />` phrase was removed, and replaced with `<placeholder />`.
  Since `arguments` had been split out, there was no longer a need for any
  `<label />` functionaliy except suppression. 
- There are 4 new `Option` properties: `arguments`, `categories`,
  and `annotations`. Each have the same structure:

```js
arguments: {value: 'argument value', start: 0, end: 2}
```

  Where `start` is the index of the first `word` with that `argument`, and `end` is the
  index of the last word *without* that argument.

- `qualifiers` follows the above format as well.
- `category` and `argument` are no longer output with `words`.


# Migrating from `lacona/lacona` 0.x

With version 1.0, changes will slow considerably and the API will stabilize.
For those who did build on 0.x, here's what changed: 

- The package name has changed from `lacona` to `elliptical` to
  reduce confusion about its relationship with the
  [Lacona app](http://lacona.io).
- `lacona-phrase` is no longer used. `createElement` is now a part of
  elliptical proper.
- Phrases are no longer represented as classes, but rather plain objects.
- `validate` has been renamed to `filterResult`
- `mapResult` was added
- there is no longer a `Parser` class. Instead, you simply compile a grammar,
  which returns an unbound parse method.
- `parseArray` has been renamed to `parse`. The ability to access output
  options as an Iterator was removed.

```js
/* old */
const parser = new Parser()
parser.grammar = <MyPhrase />
const outputs = parser.parseArray('')

/* new */
const parse = compile(<MyPhrase />)
const outputs = parse('')
```

- there is no longer a `LaconaError` class - normal JS errors are thrown.
- The phrase method known as `_handleParse` is now known as `visit`.
- `<map>`, `<filter>`, and `<tap>` are now passed the entire `Option`
  and are always called by default.
- `<map>`, `<filter>`, and `<tap>` have had their `function` prop renamed to
  `outbound`, and `inbound` was added.
- `<map>` no longer has an `iteratorFunction` prop - rather, whenever
  `outbound` returns an `Iterable`, it will be treated as such.
- Sources and `<dynamic>` have been removed entirely and modularized with
  [elliptical-observe](https://github.com/brandonhorst/elliptical-observe)
- Extensions have been removed entirely and modularized with
  [elliptical-extend](https://github.com/brandonhorst/elliptical-extend)
- Translations have been removed entirely and modularized with
  [elliptical-translate](https://github.com/brandonhorst/elliptical-translate)