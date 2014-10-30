#Contributing to Lacona

Lacona is a brand-new project with some unique ideas about linguistic parsing. The project lead is [@brandonhorst](https://github.com/brandonhorst). This document is also maintained by Brandon. If you would like to contribute, there are a number of components that need work.

- Lacona Core Development
- Lacona Phrase Development
- Lacona Phrase Translation
- Documentation: Getting Started
- Documentation: Reference Materials
- Extensions
- Demos
- Clients

##Lacona Core Development

The Lacona Core is contained in this repositiory, [brandonhorst/lacona](http://github.com/brandonhorst/github). It contains the logic for Lacona's core functionality - understanding phrases, parsing an input string, and giving output. It also contains 5 built-in phrases: `choice`, `sequence`, `repeat`, `value,` and `literal`.

The Lacona core is currently written entirely in JavaScript. Building is done using GulpJS. Tests are written using Mocha, Chai, and Sinon, and use PhantomJS for automated browser testing.

The core depends upon `lodash`, `async`, and `semver`. I would love to see these removed at some point for the sake of file size, but for now these dependencies are fine.

What needs to be done:

- Clear plan for features required for initial release
- 100% test coverage

##Lacona Phrase Development

All of the meaningful work that Lacona does is accomplished through *phrases*, Javascript Objects that define the how Lacona makes sense of input. All phrases are built out of other phrases, ultimately reducing down to the 4 fundamental built-in phrases, `choice`, `sequence`, `repeat`, and `value`. With the exception of these 4 phrases and the `literal` phrase, all phrases are maintained in separate repositories.

Phrases must be available on `npm` in a module named `lacona-phrase-<modulename>`. The module name should be succinct and lowercase. If word barriers are required, dashes should be used. Each module may contain multiple phrases in a single grammar, if they are heavily related. Each module must set module.exports to a single Javascript object - `grammar` as defined in the Lacona README.

While developers are free to create and distribute phrases in any way they want, there are a few that are considered fundamental components of lacona, even though they are stored in different repositories. Those are:

- lacona-phrase-list
	- `list`
- lacona-phrase-validator
	- `validator`
- lacona-phrase-suggester
	- `suggester`
- lacona-phrase-number
	- `integer`
	- `float`
	- `complex`
- lacona-phrase-freetext
	- `freetext`
- lacona-phrase-datetime
	- `date`
	- `time`
	- `datetime`
- lacona-phrase-currency
	- `currency`

To make Lacona premier product, all of these phrases need to be thoroughly tested (100% coverage). Additionally, more phrases will need to be added to this core list, as new phrases are developed.

##Lacona Phrase Translation

In order to fulfill the goal of being a truly international system, the core phrases must be translated into as many languages as possible.

This is, unfortunately, more complicated than simply translating some strings, like most localization projects. Because Lacona attempts to understand the actual structure of phrases, translation of many phrases will require people who are very familiar with both the Lacona system and language being translated into.

Some phrases can be translated quite easily without an intimate knowledge of the language itself, such as `lacona-phrase-number`. However, complex phrases such as `lacona-phrase-datetime` will require much more work.

Additionally, this translation is not an absolute science. There are a number of colloquial expressions in any given language, and the translators will need to decide whether to support them or not.

The project lead can only claim fluency in English, so this will need to be a team effort. When possible, it would be best to have individual language leads, so volunteers can step forward when possible.

To truly claim that Lacona is internationalized, I would like to see the core components translated into the following languages. Of course, more languages will always be better, but I would consider this the core requirement.

- Arabic []
- English [@brandonhorst]
- French []
- Portuguese []
- Russian []
- Spanish []
- Standard Chinese (Simplified) []

Within these languages there are many dialects that mean quite a bit. For example, American and British English-speakers choose to represent things like decimals and dates very differently. Those differences may, at some point, need to split up under the responibility of different leads.

##Documentation - Getting Started

Lacona needs some sort of a tutorial that serves as an introduction to its functionality and use. While the README will be sufficient for now, it will ultimately need a small site of its own, hosted with github.io.

##Documentation - Reference Materials

A full technical description of all phrase properties, method calls, and events. This will also be split off from the README and put on a github.io site.

##Extensions

Lacona is, at its core, just a library that takes input and emits events. Its functionality can be extended to provide tools more useful to the programmer.

One such extension is [`lacona-addon-stateful`](https://github.com/lacona/lacona-addon-stateful), which intercepts the standard Lacona events and emits events that may be useful for making a stateful interface.

At this moment, `lacona-addon-stateful` is the only extension that I would consider part of the Lacona core, but as others are developed, they may be included if found useful.

##Demos

There should be a number of demos that easily show the power of Lacona. A node.js CLI demo should be constructed, as well as a webpage.

These will be maintained in separate repositories.

##Clients

Of course, the main goal of a library like Lacona is to make awesome things with it. Lacona is *not* currently at the point where it is safe to use in production, but real-world experience would be excellent for its quality.

If you are interested in building something using Lacona, please contact Brandon on [Twitter](http://twitter.com/brandonhorst) or [GitHub](https://github.com/brandonhorst) to talk it over. Such a project could be very benefical to development and I would be happy to provide personalized support.
