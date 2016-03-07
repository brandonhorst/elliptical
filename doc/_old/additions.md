#Reconciliation

In `lacona`, every time the bar is called up, `describe` is called.

The problem - imagine Google Suggest - it will kick off a new request for every single input. This is async so the result cannot be supplied at describe time. However, we would like it to be described as soon as it is provided. The current start-end model does not allow for that.

Options: Combine lacona-stateful into Lacona. Consider the given outputs to be the virtual dom that we are rendering to. They could be inserted/updated/deleted accordingly. So when we setState or setConfig, it kicks off a new parse essentially.

In `lacona`, there are 4 different objects that are provided on `this` when the `describe` function is called. Each of these behaves differently.

- `props` - Provided by the parent Element. Immutable.
- `state` - Internal to the Element itself. Modified using `setState`.
- `config` - Specific to the given Phrase. Modified using `setConfig`.
- `context` - Globally accessible by all Phrases. Immutable.

In `lacona`, the complete description of a given `Phrase` is provided in the `describe` method, making use of `props`. However, it is possible that in a given environment, there may be other factors upon which the given `Phrase`'s description should be based. For example:

* Application configuration
* External state (OS state, history...)

This functionality is provided through the use of additions. Additions allow for an external system to inject information into a given `Phrase`, or for the phrase to inject this information itself. In this way, the data can be intelligently managed and maintained. In particular, additions allow:

* Any given `Phrase` to have additional objects added to its `prototype`, which can be referenced in `describe`
* A `Phrase` can modify its own additions in a way that hides the implementation.
* Additions can also be modified externally.
* All changes to additions will force a `Phrase` to be re-`describe`d.
* Async callbacks are triggered for additions changes allowing for a mechanism of persistence.

Here's how it works:

```js
class MyPhrase extends Phrase {
  static get initialAdditions() {
    return {
      config: {text: 'something'}
    }
  }

  describe() {
    return <literal text={this.config.text} />
  }

  static additionsCallback(newAdditions) {
    console.log('got new additions: ', newAdditions)
  }
}
```

```js
class MyPhrase extends Phrase {
  describe() {
    return (
      <choice>
        <freetext />
        <literal text={this.context.clipboardText} />
      </choice>
    )
  }
}
```

```js
class GoogleSuggest extends Phrase {
  handleInput(input) {
    getSuggestions(input, this.handleSuggestions.bind(this))
  }

  handleSuggestions(suggestions) {
    this.setState({results: suggestions})
  }

  describe() {
    return this.state.results.map(result => <literal text={result} />)
  }
}
```
