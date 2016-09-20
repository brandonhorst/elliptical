# 2.0.0

- **Breaking Change**: `<raw />` is now passed the full `option` object, rather than just `option.text`. This change was made in response to the understanding that some phrases need to depend upon the behavior already-parsed phrases, by accessing the `result` object. Existing code using `<raw />` should replace any references in the `func` function to the argument `input` with references to `input.text`. 

# 1.4.0

- The `describe` function of `<dynamic />` is now passed a second argument, the full `option` object. This may be useful if the function must reference the current `result`.

# 1.3.0

- `decorate` is now limited by default. That is, if a `<literal />` parses an input without decoration, it will not also attempt to parse the decorated input.

# 1.2.0

- Add the `multiplier` property, which can be used on any phrase. It multiplies the score of its results by a set amount. Useful to adjust the score of phrases without getting rid of their nuance.

# 1.1.0

- Switch Elliptical to use Lazy compilation. Individual phrases will not be compiled until they are actually parsed. This behavior can be switched off on a per-phrase basis by setting `lazy: false` on the phrase object. This slightly decreases first-parse performance, but dramatically speeds up compilation.

# 1.0.0

- Initial 1.0.0 Release (all future changes will be fully logged)

