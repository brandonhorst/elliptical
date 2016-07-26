# 1.1.0

- Switch Elliptical to use Lazy compilation. Individual phrases will not be compiled until they are actually parsed. This behavior can be switched off on a per-phrase basis by setting `lazy: false` on the phrase object. This slightly decreases first-parse performance, but dramatically speeds up compilation.

# 1.0.0

- Initial 1.0.0 Release (all future changes will be fully logged)
