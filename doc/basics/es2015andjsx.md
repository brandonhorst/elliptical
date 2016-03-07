# Note on ES2015 and JSX

Tarse is plain ES5 Javacript, and should run in any modern browser.
Anything making use of tarse may use plain ES5 as well. However,
using language features from ES2015 (ES6) and JSX makes development
significantly easier. It is recommended (but again - not required!) that
you use [Babel](https://babeljs.io/) to precompile your code into pure
ES5 format.

If you would like to, you can set up your project like this:

```sh
npm install babel-preset-es2015 --save-dev
npm install babel-plugin-transform-react-jsx --save-dev
```

JSX needs a `pragma` to know the name of the `element` function. If you leave
it out, JSX defaults to `React.createElement` and your code will throw
lots of `React is not defined` errors.

Set the `pragma` in your `.babelrc` file:

{
  "presets": ["es2015"],
  "plugins": [
    ["transform-react-jsx", {"pragma": "element"}]
  ]
}
Alternatively, you can specify it in each of your
files with a `@jsx` pragma comment. You will need to put this comment
at the top of every file that imports `element`.

```js
/** @jsx element */

import {element} from 'tarse'
```

If tarse will be running on your server, you can use `babel-cli` to compile
your source files to plain ES5.

```js
npm install --save-dev babel-cli

#compile all files in `src` and puts them in `lib`
babel src -d lib
```

If tarse will be running in a browser, you should make use of
[Browserify](http://browserify.org/).

```sh
npm install --save-dev browserify
npm install --save-dev babelify

# compile the entry point `src/index.js` to `dist/script.js`
browserify -t babelify src/index.js -o dist/script.js
```

Please note that if you wish to use `function *` generators
in the browser, you will likely need to use `babel-plugin-transform-runtime`
and `babel-runtime`, as generators are not yet supported by all
major browsers.
