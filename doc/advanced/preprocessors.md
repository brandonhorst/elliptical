# Processors

Phrases are very powerful, but they can be made even more powerful by using
processors.

```js
Processor: (element: Element) => Element
```

A processor takes an element and augments or simplifies its behavior in some
way. Passing a Processor to `compile` will apply that Processor to every
element before it is compiled.

There are a number of pre-built processors to add functionality to phrases.
[elliptical-translate](https://github.com/brandonhorst/elliptical-translate),
for example, allows phrases to specify multiple languages, and the processor
will select the most appropriate language when `compile` is called.

## `combineProcessors`

If you ned to use multiple Processors, you may combine them using
`combineProcessors`.

```js
/** @jsx createElement */
import createTranslateProcessor from 'elliptical-translate'
import createExtendProcessor from 'elliptical-extend'
import {createElement, compile, combineProcessors} from 'elliptical'
import MyPhrase from '../my-phrase'

const processor = combineProcessors(
  createTranslateProcessor(['en-US', 'en']),
  createExtendProcessor([])
)

const parse = compile(<MyPhrase />, processor)
```

