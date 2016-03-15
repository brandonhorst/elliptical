# Contributing to Elliptical

## Feature Requests

If you have a feature you'd like added, open up an issue first to discuss it.
If the idea is accepted, feel free try
and implement the feature and submit a pull request.

You should also add tests and documentation for any new feature you'd added.

## Testing

Make sure that all tests pass before submitting a pull request. Elliptical
uses Mocha to run tests. You can run them with

```
npm install
npm test
```

For development, you can use

```
npm test -- -w -b
```

This will watch all files for changes, and break on the first test
failure encountered.

## Style

Elliptical uses [Standard](https://github.com/feross/standard) Javascript style.

## Releases

Releases will be managed by the project lead (Brandon), and the last released
code will live in the `release` branch. If you need a release, please open
up an issue.

## Clients

Of course, the main goal of a library like elliptical is to make awesome
things with it.

If you are interested in building something using elliptical, feel free to
contact Brandon on [Twitter](http://twitter.com/brandonhorst) or
[GitHub](https://github.com/brandonhorst) to talk it over. Personalized
support is available through Lacona Labs.
