# Note on ES2015 and JSX

Elliptical is plain ES5 Javacript, and should run in any modern browser.
Anything making use of elliptical may use plain ES5 as well. However,
using language features from ES2015 (ES6) and JSX makes development
significantly easier. It is recommended (but again - not required!) that
you use [Babel](https://babeljs.io/) to precompile your code into pure
ES5 format.

## Using Babel

If you would like to, you can set up your project like this:

```sh
npm install babel-preset-es2015 --save-dev
npm install babel-plugin-transform-react-jsx --save-dev
```

## JSX Pragma

JSX needs a `pragma` to know the name of the `createElement` function.
If you leave it out, JSX defaults to `React.createElement` and your
code will throw lots of `React is not defined` errors.

You can specify this pragma it in each of your
files with a `@jsx` pragma comment. You will need to put this comment
at the top of every file that imports `element`.

```js
/** @jsx createElement */

import {createElement} from 'elliptical'
```

Alternatively, you can set the `pragma` in your `.babelrc` file:

```
{
  "presets": ["es2015"],
  "plugins": [
    ["transform-react-jsx", {"pragma": "element"}]
  ]
}
```

However, keep in mind that this will likely cause your linter to complain.

## Building

If elliptical will be running on your server, you can use `babel-register`
to compile your source files to plain ES5.

If elliptical will be running in a browser, you should make use of
[Browserify](http://browserify.org/) or [Rollup](http://rollupjs.org/) to 
build browser runnable code.

```sh
npm install --save-dev browserify
npm install --save-dev babelify

# compile the entry point `src/index.js` to `dist/script.js`
browserify -t babelify src/index.js -o dist/script.js
```

## Note about Generators

Please note that if you wish to use `function *` generators
in the browser, you will likely need to use `babel-plugin-transform-runtime`
and `babel-runtime`, as generators are not yet supported by all
major browsers.
