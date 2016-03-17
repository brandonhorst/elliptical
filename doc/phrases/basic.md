# Basic Built-in Phrases

These phrases are used to match specific pieces of input, and are the
fundamental tools for parsing language with elliptical.

## <literal>

The most basic phrase. Matches or suggests a single string.

## <list>

Matches or suggests many strings. In most ways, this is simply a
better-performing shorthand for a `<choice>` of `<literal>`s.

## <freetext>

Matches any input, and does not make suggestions. Input can be filtered
by regular expressions or arbitrary code.