# Placeholders

When a user is typing a sentence, there are a million ways that it could go.
And oftentimes, certain choices at one point in the sentence impact future
directions that the sentence could take. This means that enumerating all
possible options for a sentence gets exponentially harder as the sentence
gets longer.

Humans can't process millions of options at once.
The user is only concerned with "what is the next choice
I have to make" and only needs a vague idea of sentence options beyond that.

In Elliptical, this is handled through the `<placeholder />` element.

When the parser is parsing a tree and hits a `<placeholder />`, it checks
to see if all of the input text has been consumed. If it has, it simply
outputs a `Word` with `placeholder: true` and continues. The `<placeholder />`'s
child is not parsed.

If there is input text remaining, the child will be parsed as usual.
