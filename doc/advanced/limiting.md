# Limiting

Limiting dramatically increases performance and usability by preventing
extraneous parsing.

`<choice>`, `<list>`, and `<freetext>` can be limited. If one output from
the element parses to completion, no further outputs will parse.

In general, limits should be applied agressively. Insufficiently-limited
grammars are very slow to parse and result in many unneeded output options
for the user to deal with.

## Limiting Order

For a `<choice>`, the outputs are attempted in the order they appear in the
grammar.

For a `<list>`, the outputs are attempted based upon the score that comes
from parsing each item.

For a `<freetext>`, the outputs are attempted based based upon the `greedy`
prop - shortest-to-longest by default, or longest-to-shortest if `greedy` is
true.
