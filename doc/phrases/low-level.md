# Low Level Phrases

These commands touch `options` directly and should be used only when
absolutely necessary. 

See the API Reference for full specifications.

## <map>

Map options using an arbitrary function
In most cases, you should use the `mapResult` function on a Phrase.

## <filter>

Map parse branches using an arbitrary function that evaluates options.
In most cases, you should use the `filterResult` function on a Phrase.

## <tap>

Examine options at a specific point in the chain, but do not modify them.
Useful for debugging or triggering external behavior based on elliptical
input.

## <raw>

Consume text based upon an arbitrary function. In almost all cases, you should
be using `<literal>`, `<list>`, or `<freetext>` instead.