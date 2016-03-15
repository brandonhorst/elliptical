# Sources

So far, everything we have seen about Phrases are completely static. Lacona also allows for dynamic phrases. However, in order to manage complexity, dynamic behavior is abstracted through Sources.

Sources are owned by `Phrase`s. Each `Phrase` defines which sources it needs, and the sources are automatically managed for the `Phrase`. This is sometimes known as "sideways data loading," because the Phrase had information that does not come from its parent. It dramatically simplifies the grammar by allowing phrases to be entirely abstracted.

## An Example

```jsx
/** @jsx createElement */

import { createElement, Phrase, Source } from 'lacona-phrase'
import { readdir } from 'fs'
import { join } from 'path'
import { Parser } from 'lacona'

class DirectoryContents extends Source {
  state = []

  onCreate () {
    readdir(this.props.path, (err, files) => {
      if (!err) {
        this.setData(files)
      }
    })
  }
}

class File extends Phrase {
  observe () {
    return <DirectoryContents path={this.props.directory} />
  }

  describe () {
    const items = this.source.data.map(filename => {
      return {text: filename, value: join(this.props.directory, filename)}
    })

    return <list items={items} />
  }
}

function doParse() {
  const output = parser.parseArray('open Cal')
  console.log(output)
}

const parser = new Parser({
  grammar: (
    <sequence>
      <literal text='open ' />
      <File directory='/Applications' id='appPath' />
    </sequence>
  )
})

parser.on('update', doParse)
doParse()

/*
[]
*/

/*
[
  {
    result: {
      appPath: /Applications/Calculator.App
    },
    score: 1,
    words: [
      {text: 'open ', input: true}
      {text: 'Cal ', input: true}
      {text: 'endar.app ', input: false}
    ]
  }, {
    result: {
      appPath: /Applications/Calendar.App
    },
    score: 1,
    words: [
      {text: 'open ', input: true}
      {text: 'Cal ', input: true}
      {text: 'culator.app ', input: false}
    ]
  }
]
*/
```

### Pragma and Imports

```js
/** @jsx createElement */

import { createElement, Phrase, Source } from 'lacona-phrase'
import { readdir } from 'fs'
import { join } from 'path'
import { Parser } from 'lacona'

```

We're still using JSX, so we still need the `createElement` pragma.

We need a new class from `lacona-phrase` now - `Source`. All sources must extend this class.

For this example, we will assume a node.js environment. [`fs.readdir`](https://nodejs.org/api/fs.html#fs_fs_readdir_path_callback) is a function which asyncronously returns an array of filenames within a given directory. [`path.join`](https://nodejs.org/api/path.html#path_path_join_path1_path2) joins path components into a normalized path.

### Source Definition

```jsx
class DirectoryContents extends Source {
  onCreate () {
    this.setData([])

    readdir(this.props.path, (err, files) => {
      if (!err) {
        this.setData(files)
      }
    })
  }
}
```

We create a new class called `DirectoryContents` that extends `Source`. It has a single method, `onCreate()`. `onCreate` is automatically called whenever a new source is instantiated, which is managed automatically.

Every `Source` has a method called `setData(newData)`. This replaces `Source`'s `data` property, and forces all `Phrase`s using this source to be re-described.

In this case, the `onCreate()` method calls setData immediately to set the initial data to an empty string. It then kicks off an asyncronous request (`readdir()`). When the callback is called, it will call `setData` again, this time with actual data. In this case, setData is an array of strings, but it can be any JavaScript object or literal.

**Always** use `setData(newData)` to update the `Source`'s data - never mutate the `data` property directly.

Note that for developers coming from React: `setData` does **not** merge object properties like `setState`. It always replaces the data object entirely.

### Phrase Definition

```jsx
class File extends Phrase {
  observe () {
    return <DirectoryContents path={this.props.directory} />
  }

  describe () {
    const items = this.source.data.map(filename => {
      return {text: filename, value: join(this.props.directory, filename)}
    })

    return <list items={items} />
  }
}
```

Here we have a typical `Phrase` called `TempFile`. In addition to the normal `describe()` method, we have a new one - `observe()`. `observe()` works very similarly to `describe()` - it takes no arguments, and it declaratively returns a `LaconaElement` (specified with JSX). However, in this case, the `LaconaElement`s represent `Source`s, not `Phrase`s. The similarities are intentional - `Source`s can be used and combined in the same powerful way that `Phrase`s can be.

Just like `describe()`, `observe()` can make use of `this.props`. And, of course, it can pass props to the `Source`s that it uses.

In this case, we are returning a single `LaconaElement` - `<DirectoryContents />`. We are passing it a prop called `path`, which is really just one of our props called `directory`.

We don't need to know how `<DirectoryContents />` works. We don't care if it's sync or async. All we know is that if we give it a `path`, it will set its `data` to a list of filenames in the directory specified by that `path`.

In our `describe()` method, we are making use of this source. The `Phrase` specified by the `LaconaElement` returned from `observe()` is accessible as `this.source`. We can access the `data` property directly. In this case, we are converting the array of `filename`s to an `items` array for use in a `<list />` `Phrase`.

Note that in this situation, `describe()` is actually going to be called twice - once when the `File` phrase is created (and `this.source.data` is an empty array), and once when the `readdir` callback is called and the source calls `setData` again. The `Phrase` will know that its source has new data, and it will call `describe` again. Now, `this.source.data` is a full array.

### Tying Things Up

```jsx
function doParse() {
  const output = parser.parseArray('open Cal')
  console.log(output)
}

const parser = new Parser({
  grammar: (
    <sequence>
      <literal text='open ' />
      <File directory='/Applications' id='appPath' />
    </sequence>
  )
})

parser.on('update', doParse)
doParse()
```

Here, we are providing the `lacona` `Parser` with a `grammar` just as before. However, we also see something new - `Parser` is a standard Node [`EventEmitter`](https://nodejs.org/api/events.html). You can subscribe to an event called `update`, which will be triggered when any `Source` used in the `grammar` is updated. In this case, we're calling `doParse` right after `parser` is instantiated, and after its `update` event.

### Output

```js
/*
[]
*/

/*
[
  {
    result: {
      appPath: /Applications/Calculator.App
    },
    score: 1,
    words: [
      {text: 'open ', input: true}
      {text: 'Cal ', input: true}
      {text: 'endar.app ', input: false}
    ]
  }, {
    result: {
      appPath: /Applications/Calendar.App
    },
    score: 1,
    words: [
      {text: 'open ', input: true}
      {text: 'Cal ', input: true}
      {text: 'culator.app ', input: false}
    ]
  }
]
*/
```

We see that `console.log` is called twice. The first time it is called (immediately), the output is an empty array. The `DirectoryContents` `Source` had no data, so the `File` returned a `<list />` with no items.

The second `console.log` is called only a few fractions of a second later, but this time with data. The `readdir` call has triggered the callback, updating the `Source`'s `data` property, triggering the `parser::update` event, and ultimately causing a reparse with the desired list items.

The `Phrase` is still fully declarative. All of the external interaction and the asyncronous behavior are relegated to the `Source`.
