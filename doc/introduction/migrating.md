# Migrating from `lacona/lacona` 0.x

With version 1.0, changes will slow considerably and the API will stabilize.
For those who did build on 0.x, here's what changed: 

- The package name has changed from `lacona` to `elliptical` to
  reduce confusion about its relationship with the
  [Lacona app](http://lacona.io).
- `lacona-phrase` is no longer used. `createElement` is now a part of
  elliptical proper. Because of this, phrases published independently
  should use `peerDependencies` to refer to elliptical.
- Phrases are no longer represented as classes, but rather plain objects.
- `validate` has been renamed to `filterResult`
- `mapResult` was added
- there is no longer a `Parser` class. Similar behavior can be achieved with
  `const {parse} = createParser(<grammar>)`
- `parseArray` has been renamed to `parse`. The ability to access output
  options as an Iterator was removed.
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