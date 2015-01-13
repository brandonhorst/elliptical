var asyncEach = require('async-each');
var clone = require('lodash.clone');
var defaults = require('lodash.defaults');
var difference = require('lodash.difference');
var find = require('lodash.find');

var nextTempId = 0;

//function pickFirstMatching
// returns the value from object obj that has the key first in the array list
function pickFirstMatchingKey(obj, list) {
  var entry, value;
  var i, l;

  for (l = list.length, i = 0; i < l; i++) {
    entry = list[i];
    value = obj[entry];
    if (value) {
      return entry;
    }
  }
  return null;
}

function getBestElementLang(translations, langs) {
  var baseLangs = langs.map(function (lang) {
    return lang.split('_')[0];
  });

  return pickFirstMatchingKey(translations, langs.concat(baseLangs)) || 'default';
}

//class Phrase
function Phrase(obj, props, constructor) {
  var this_ = this;
  var objProp;

  //set each property on the class object to be a property on this
  for (objProp in obj) {
    if (obj.hasOwnProperty(objProp)) {
      this[objProp] = typeof obj[objProp] === 'function' ?
        obj[objProp].bind(this) :
        obj[objProp];
    }
  }

  //store the constructor in case it needs to be cloned (by sequence)
  this._constructor = constructor;

  //set up the translations, or handleParser if it is provided
  if (obj._handleParse) {
    this._handleParse = obj._handleParse.bind(this);
  } else {
    this.elements = {};
    obj.translations.forEach(function (schema) {
      //only store the function until it actually gets used
      var element = schema.describe;

      schema.langs.forEach(function (lang) {
        this_.elements[lang] = element;
      });
    });
  }

  //call onCreate if it exists
  if (this.getDefaultProps) {
    this.props = defaults(props || {}, this.getDefaultProps());
  } else {
    this.props = props || {};
  }

  //give a _temp id if none was provided - all phrases must have an id
  if (!this.props.id) {
    this.props.id = '_temp' + nextTempId;
    nextTempId++;
  }

  if (this.onCreate) {
    this.onCreate();
  }

  //initialize extenders and overriders
  this._extenders = {};
  this._overriders = {};
}

Phrase.prototype._checkExtensions = function (extensions) {
  var this_ = this;
  ['extenders', 'overriders'].forEach(function (name) {
    var cachedExtensions = Object.keys(this_['_' + name]);
    var currentExtensions = Object.keys(extensions[name]);

    var newExtensions = difference(currentExtensions, cachedExtensions);
    var removedExtensions = difference(cachedExtensions, currentExtensions);

    newExtensions.forEach(function (newExtension) {
      this_['_' + name][newExtension] = extensions[name][newExtension](this_.props);
    });

    removedExtensions.forEach(function (removedExtension) {
      delete this_['_' + name][removedExtension];
    });
  });
};

Phrase.prototype.parse = function(options, data, done) {
  var preParseOptions = clone(options);
  var oldResult = options.input.result;
  var this_ = this;
  var phraseRunning = false;
  var extendersRunning = true;
  var overridersRunning = true;
  var overriderGotData = false;

  function phraseData(newOption) {
    var optionWithoutTemps = newOption.clearTemps();

    var newResult = this_.getValue ?
      this_.getValue(optionWithoutTemps.result) :
      optionWithoutTemps.result;

    var newOptionOldResult = optionWithoutTemps.replaceResult(oldResult);

    var newOptionNewResult = this_.props.id ?
      newOptionOldResult.handleValue(this_.props.id, newResult) :
      newOptionOldResult;

    return sendData(newOptionNewResult);
  }

  function phraseDone() {
    phraseRunning = false;
    checkDoneCondition();
  }

  function extendersDone() {
    extendersRunning = false;
    checkDoneCondition();
  }

  function checkDoneCondition() {
    if (!extendersRunning && !phraseRunning && !overridersRunning) {
      done();
    }
  }

  function sendData(option) {
    data(option.stackPop());
  }

  function overriderData(newOption) {
    overriderGotData = true;
    sendData(newOption);
  }

  function overridersDone() {
    overridersRunning = false;
    if (!overriderGotData) {
      parseElement();
    } else {
      checkDoneCondition();
    }
  }

  function parseElement() {
    var lang, newOptions;

    phraseRunning = true;

    if (this_._handleParse) {
      this_._handleParse(options, data, done);
    } else {
      lang = getBestElementLang(this_.elements, options.langs);
      newOptions = clone(preParseOptions);

      newOptions.input = newOptions.input.replaceResult({});

      if (typeof this_.elements[lang] === 'function') {
        this_.elements[lang] = this_.elements[lang].call(this_);
      }

      this_.elements[lang].parse(newOptions, phraseData, phraseDone);
    }
  }

  //if this is already on the stack, and we've made a suggestion, we need to stop
  // we don't want to cause an infinite loop
  if (options.input.suggestion.words.length > 0 && find(options.input.stack, {name: this.name})) {
    done();
    return;
  }

  //add this to the stack before doing anything
  preParseOptions.input = preParseOptions.input.stackPush({
    name: this.name,
    category: this.props.category
  });

  //Update the extension cache
  this._checkExtensions(options.getExtensions(this.name));

  //If it is optional, a branch will skip it entirely
  if (this.props.optional) {
    data(options.input);
  }

  //Check the extenders - don't call done until all are complete
  asyncEach(Object.keys(this._extenders), function (extender, done) {
    this_._extenders[extender].parse(preParseOptions, sendData, done);
  }, extendersDone);

  //Check the overriders - don't call phrase parse unless none return data
  asyncEach(Object.keys(this._overriders), function (overrider, done) {
    this_._overriders[overrider].parse(preParseOptions, overriderData, done);
  }, overridersDone);
};

module.exports = Phrase;
