var _ = require('lodash');

var Phrase = function(options, scope, elementFactory) {
  'use strict';
  var grammar;
  var lang;
  var langs;
  var i;
  var j;
  var grammarLength = options.grammars ? options.grammars.length : 0;
  var langLength;
  
  this.scope = scope;
  this.name = options.name;
  this.evaluate = options.evaluate;
  this.run = options.run;

  this['extends'] = options['extends'] ? options['extends'] : [];
  this.precedes = options.precedes ? options.precedes : [];
  this.grammars = {};

  if (typeof options.grammars !== 'undefined') {
    for (i = 0; i < grammarLength; i++) {
      grammar = options.grammars[i];
      langs = _.isArray(grammar.lang) ? grammar.lang: [grammar.lang];
      langLength = langs.length;
      for (j = 0; j < langLength; j++) {
        lang = langs[j];
        this.grammars[lang] = elementFactory.create(grammar.root);
      }
    }
  } else {
    this.grammars['default'] = elementFactory.create(options.root);
  }
};

Phrase.prototype.parse = function(input, lang, context, data, done) {
  'use strict';
  var node = this.grammars[lang] || this.grammars[lang.split('_')[0]] || this.grammars.default;

  var nodeData = function(result) {
    var newResult;
    newResult = result.clearTemps();
    return data(newResult);
  };

  node.parse(input, lang, context, nodeData, done);
};

Phrase.prototype.getValue = function(options, result, done) {
  'use strict';
  if (typeof this.evaluate !== 'undefined') {
    return this.scope[this.evaluate].call(options, result, done);
  } else {
    return done(null, result['@value']);
  }
};

module.exports = Phrase;
