(function() {
  var EventEmitter, Phrase, _;

  EventEmitter = require('events').EventEmitter;

  _ = require('lodash');

  Phrase = (function() {
    function Phrase(options, scope, elementFactory) {
      var grammar, lang, langs, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      this.scope = scope;
      this.name = options.name, this.evaluate = options.evaluate, this.run = options.run;
      this["extends"] = (_ref = options["extends"]) != null ? _ref : [];
      this.precedes = (_ref1 = options.precedes) != null ? _ref1 : [];
      this.grammars = {};
      if (options.grammars != null) {
        _ref2 = options.grammars;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          grammar = _ref2[_i];
          langs = _.isArray(grammar.lang) ? grammar.lang : [grammar.lang];
          for (_j = 0, _len1 = langs.length; _j < _len1; _j++) {
            lang = langs[_j];
            this.grammars[lang] = elementFactory.create(grammar.root);
          }
        }
      } else {
        this.grammars["default"] = elementFactory.create(options.root);
      }
    }

    Phrase.prototype.parse = function(input, lang, context, data, done) {
      var node, _ref, _ref1;
      node = (_ref = (_ref1 = this.grammars[lang]) != null ? _ref1 : this.grammars[lang.split('_')[0]]) != null ? _ref : this.grammars["default"];
      return node.parse(input, lang, context, function(result) {
        var newResult;
        newResult = result.clearTemps();
        return data(newResult);
      }, done);
    };

    Phrase.prototype.getValue = function(options, result, done) {
      if (this.evaluate != null) {
        return this.scope[this.evaluate].call(options, result, done);
      } else {
        return done(null, result['@value']);
      }
    };

    return Phrase;

  })();

  module.exports = Phrase;

}).call(this);
