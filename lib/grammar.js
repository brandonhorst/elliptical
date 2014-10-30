var _ = require('lodash');
var elementFactoryFactory = require('./element-factory');
var Phrase = require('./phrase');
var semver = require('semver');

var Grammar = function(options, allGrammars, isLiteral) {
  var elementFactory = elementFactoryFactory(this);

  this.scope = options.scope;
  this._allGrammars = allGrammars;

  if (!isLiteral) {
    this._literal = new Grammar(require('./literal'), allGrammars, true);
  }

  if (!options.dependencies) {
    options.dependencies = [];
  }

  this.dependencies = _.map(options.dependencies, function(dependency) {
    return new Grammar(dependency, allGrammars);
  });

  this.phrases = _.map(options.phrases, function (phrase) {
    return new Phrase(phrase, options.scope, elementFactory);
  });
};

function _checkGrammarsForPhrasesInheriting(grammars, inheritedPhrase) {
  var i, j, l, m;
  var grammar, phrase, phraseName, version;
  var inheritingPhrases = [];

  for (l = grammars.length, i = 0; i < l; i++) {
    grammar = grammars[i];
    for (m = grammar.phrases.length, j = 0; j < m; j++) {
      phrase = grammar.phrases[j];
      for (phraseName in phrase.inherits) {
        if (phrase.inherits.hasOwnProperty(phraseName)) {
          version = phrase.inherits[phraseName];
          if (inheritedPhrase.name === phraseName && semver.satisfies(inheritedPhrase.version, version)) {
            inheritingPhrases.push(phrase);
          }
        }
      }
    }
  }
  return inheritingPhrases;
}

function _checkGrammarsForPhraseNamed(grammars, name) {
  var i, j, l, m;
  var grammar, phrase;

  for (l = grammars.length, i = 0; i < l; i++) {
    grammar = grammars[i];
    for (m = grammar.phrases.length, j = 0; j < m; j++) {
      phrase = grammar.phrases[j];
      if (phrase.name === name) {
        return phrase;
      }
    }
  }
  return null;
}

Grammar.prototype.getPhrasesNamed = function (name) {
  var phrase;

  if (name === 'literal') {
    return [this._literal.phrases[0]];

  } else {
    phrase = _checkGrammarsForPhraseNamed([this], name) ||
      _checkGrammarsForPhraseNamed(this.dependencies, name);

    return [phrase].concat(_checkGrammarsForPhrasesInheriting(this._allGrammars, phrase));
  }
};

module.exports = Grammar;
