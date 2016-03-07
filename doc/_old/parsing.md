# Parsing

As soon as an element is loaded, `describe` is called. This generates the parse tree for that element.

Later on, we can apply tree-diffing like React to make reacting to changes quick. However, I don't think that phrase instantiation is going to be a performance limitation just yet, because props and config and stuff should be changing pretty infrequently.

Parsing simply traverses the describe tree, returning Options from all of the `value`s until it hits bottom. Async behavior is governed by callbacks. Let's implement the classical computedList, computedSuggester, computedValidator

```js
class computedValidator extends Phrase {
  validate(input) {
    return this.props.validate(input) ? [{text: input, value: input}] : []
  }

  describe() {
    return <value compute={this.validate.bind(this)} />
  }
}
```

```js
class computedList extends Phrase {
  describe() {
    return this.props.items.map(item => <literal text={item.text} value={item.value} />)
  }
}
```

```js
class computedSuggester extends Phrase {
  static get initialState() {
    return {suggestions: {}}
  }

  recieveInput(input) {
    $getSuggestions(input, suggestions => this.setState({suggestions: {[input]: suggestions}}))
  }

  describe() {
    return _.map(this.state.suggestions.map((input, item => <literal text={item.text} value={item.value} />)
  }
}
```

`recieveInput` is called whenever a given component recieves an attempt to parse a given input. The phrase is expected to kick off some async job which will modify the state, which will then in turn trigger the phrase to be re-described. This all happens asyncronously, independently of any parsing. When this happens, an event will be emitted which will allow listeners who are interested to re-parse their current input.

The problem is that unlike react, the `describe` tree cannot be rendered to completeness. This is because `lacona` grammars can be recursive indefinitely. This means that the describe step cannot be completely independent from the parse step, because it will have no idea how deep to go.

Solution: Call `describe` on-demand, like is done right now. When a description is dirtied, don't actually re-describe anything, just say that it could be re-described and there may be new information. Some point, we may reach a point where we no what we do and do not have to re-describe, but it is not this day.

So what I really need to do is isolate the Describe tree from the actual Phrase tree.

## Config

Providing config and context as props would be very convenient. However, this does cause problems.

- Extensions can have their own config settings obviously, but they take on the props of the object that they are extending. Naive merging could be dangerous, because `config` and `context` are words that people will likely want to use.
- There needs to be a way for sentences to set their own config. Lacona big L will handle that I guess
- Is there a use case for accessing the config of other phrases? Maybe but not yet

Solution: allow for additions, but not setting them just yet. They are set with a static method, which marks the entire sentence as dirty

## Problems with this.state

Unlike React, a given Phrase is much more independent of its parents. A `<file />` phrase is just dependant on the filesystem. It seems like a lot of unnecessary work for all of the <file /> phrases in existance not to be able to share some sort of cache.

#### Proposal

Make a third property, called `this.store`.  Unlike state, this is a property on the prototype of a given phrase. Of course, developers can choose to use it or not. Writes to `this.store` will dirty all phrases that have access to it.

Let's not bother with this just yet - `this.state` will result in some extra processing but it will work for the time being.
