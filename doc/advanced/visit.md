# Implementing Visit

Every now and then, you need to create a phrase that manipulates options
manually, rather than simply describing a grammar with elements.
This is the lowest-level elliptical feature, and most people will never
need to use it.

```js
visit: (option: Option, element: Element) => Iterable<Option>
```

The `visit` function will only be called if `describe` does not exist.
If it needs to parse children, it can do so with the `traverse` function
provided in the elliptical package.


```js
import {traverse} from 'elliptical'

const MyPhrase = {
  visit (option, {props, children}) {
    console.log('props', props, 'option', option)
    return traverse(children[0])
  }
}
```