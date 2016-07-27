# 1.2.0

- Add the `multiplier` property, which can be used on any phrase. It multiplies the score of its results by a set amount. Useful to adjust the score of phrases without getting rid of their nuance.

# 1.1.0

- Switch Elliptical to use Lazy compilation. Individual phrases will not be compiled until they are actually parsed. This behavior can be switched off on a per-phrase basis by setting `lazy: false` on the phrase object. This slightly decreases first-parse performance, but dramatically speeds up compilation.

# 1.0.0

- Initial 1.0.0 Release (all future changes will be fully logged)
