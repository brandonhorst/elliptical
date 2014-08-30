#`lacona` `grammar`

In `lacona`, language is specified using JavaScript objects. Ultimately, these objects are known as `phrase`s - individual linguistic components. Note that a lacona `phrase` does not necessarily need to be a linguistic phrase - it could be a punctuation mark, a word, a sentence, or a whole paragraph.

`phrase`s are composed of other `phrase`s. Ultimately, all phrases reduce down to the four built-in `phrase`s - `value`, `sequence`, `choice`, and `repeat`. These are the only `phrase`s that Lacona understands by default.

To make it understand more things, you pass `grammar` objects to `Parser#understand`. This document details how a `grammar` object is defined.

Note that the words like 'grammar,' 'schema,' and 'phrase' have real English meanings, so in this documentation, the formal `lacona` constructs will always be specified as \`code\` - `grammar`, `schema`, and `phrase`.

##`grammar`

```
{
	phrases: [ phraseDefinition ], //required
	dependencies: [ grammar ]
	scope: scope,
}
```

The object passed to `Parser#understand`.

##`scope`

```
{
	name: Function(),
	name2: Function(),
	...
}
```

A `scope` object contains arbitrarily-named functions that will be referenced by name by `phrase`s in the `schema`. `scope` functions are only accessible by `schema`s in the same `grammar`.

##`phraseDefinition`

```
{
	name: String, //required
	version: String, //defaults to 0.0.0
	schemas: [{
		langs: [ String ], //required
		root: phraseReference //required
	} || root: phraseReference, //required
	extends: [ String ] || {phraseName: version},
	precedes: [ String ] || {phraseName: version}
}
```

If no `schemas` property is provided, it will look for a `root` property. The `lang` defaults to `default`.

```
{root: x} == {schema: {lang: 'default', root: x}}
```

For `extends` and `precedes`, the `version` default to 0.0.0:

```
'somePhrase' == ['somePhrase'] == {somePhrase: '0.0.0'}
```

##`phraseReference`

```
String || [ phraseReference ] || {
	type: String, //required
	id: String,
	optional: Boolean, //defaults to false
	options...
}
```

If a `String` is provided, it will be used as the `value` and `display` of a `literal`. If an `Array` is provided, it will be used as the `children` of a `sequence`.

```
'test' == {type: 'literal', display: 'test', value: 'test'}

[phraseRef1, phraseRef2] = {type: sequence, children: [phraseRef1, phraseRef2]}
```

The `type` property must be the same as some `name` property of a phrase listed in the `grammar`'s `dependencies`, otherwise it throws a runtime error.

Any properties beyond these 3 will be passed to the `phrase`.