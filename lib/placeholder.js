var asyncEach = require('async-each');
var Element = require('./element');
var LaconaError = require('./error');
var inherits = require('inherits');
var util = require('./util');

var Placeholder = function(options, grammar) {
  Placeholder.super_.call(this, options);

  if (!options.type) {
    throw new LaconaError('Every phraseReference must have a type');
  }

  this.type = options.type;
  this.options = util.omit(options, 'type');
  this.grammar = grammar;
};

inherits(Placeholder, Element);

Placeholder.prototype.handleParse = function handleParse(options, data, done) {
  var this_ = this;
  var oldResult = util.clone(options.input.result);
  var phrases = this.grammar.getPhrasesNamed(this.type);
  var currentContext = util.clone(this.options);

  currentContext.$call = function(func) {
    var args = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [];

    var callContext = options.context || this_.options;

    return this_.grammar.scope[func].apply(callContext, args);
  };

  function eachPhrase(phrase, done) {

    function phraseData(option) {
      function handleValue(err, value) {
        var newOption;
        newOption = option.replaceResult(oldResult);
        newOption = newOption.handleValue(this_.id, value);
        data(newOption);
        currentlyInData--;
        if (currentlyInData === 0 && doneCalled) {
          done();
        }
      }

      currentlyInData++;

      phrase.getValue(currentContext, option.result, handleValue);
    }

    function phraseDone(err) {
      if (err) {
        done(err);
      } else if (currentlyInData === 0) {
        done();
      } else {
        doneCalled = true;
      }
    }

    var currentlyInData = 0;
    var doneCalled = false;

    var newOptions = util.clone(options);

    if (options.input.stack.slice(0, -1).indexOf(this_) !== -1) {
      done();
      return;
    }

    newOptions.context = currentContext;

    phrase.parse(newOptions, phraseData, phraseDone);
  }

  asyncEach(phrases, eachPhrase, done);
};

module.exports = Placeholder;
