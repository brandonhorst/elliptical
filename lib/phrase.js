var asyncEach = require('async-each');
var _ = require('lodash');

var InputOption = require('./input-option');

var nextTempId = 0;

function getBestElementLang(translations, langs) {
  var baseLangs = _.map(langs, function (lang) {
    return lang.split('_')[0];
  });

  return _.chain(langs).concat(baseLangs).find(function (lang) {
    return translations[lang];
  }).value() || 'default';
}

//class Phrase
function Phrase(obj, props, constructor, guid) {
  //set each property on the class object to be a property on this
  _.assign(this, obj);
  _.bindAll(this);

  //store the constructor in case it needs to be cloned (by sequence)
  this.factory = constructor;

  //store the guid for recursion checking
  this.guid = guid;

  //set up the translations, or handleParser if it is provided
  if (obj._handleParse) {
    this._handleParse = obj._handleParse.bind(this);

  } else {
    this.elements = _.transform(obj.translations, function (acc, value) {
      _.forEach(value.langs, function (lang) {
        acc[lang] = {
          describe: value.describe,
          cache: null
        };
      });
    }, {});
  }

  //set the default props
  this.props = _.defaults(props || {}, this.getDefaultProps());

  //give a _temp id if none was provided - all phrases must have an id
  if (!this.props.id) {
    this.props.id = '_temp' + nextTempId;
    nextTempId++;
  }

  //call onCreate
  this.onCreate();

  //initialize extenders and overriders
  this._extenders = {};
  this._overriders = {};
}

//noop - can be overridden
Phrase.prototype.getDefaultProps = function() { return {}; };

//noop - can be overridden
Phrase.prototype.onCreate = function() { };

Phrase.prototype._clearDescribeCache = function () {
  _.forEach(this.elements, function (element) {
    element.cache = null;
  });
};

//given all extensions (from the parser), make sure our cache is up-to-date
// if it is not, update it
Phrase.prototype._checkExtensions = function (extensions) {
  var this_ = this;
  ['extenders', 'overriders'].forEach(function (name) {
    var cachedExtensions = Object.keys(this_['_' + name]);
    var currentExtensions = Object.keys(extensions[name]);

    var newExtensions = _.difference(currentExtensions, cachedExtensions);
    var removedExtensions = _.difference(cachedExtensions, currentExtensions);

    newExtensions.forEach(function (newExtension) {
      this_['_' + name][newExtension] = extensions[name][newExtension](this_.props);
    });

    removedExtensions.forEach(function (removedExtension) {
      delete this_['_' + name][removedExtension];
    });
  });
};

Phrase.prototype.parse = function(input, options, data, done) {
  var this_ = this;
  var preParseInputData;
  var oldResultStored = input.result;
  var phraseRunning = false;
  var extendersRunning = true;
  var overridersRunning = true;
  var overriderGotData = false;

  function phraseData(input) {
    var newInputData = input.getData();
    var oldResult = _.clone(oldResultStored);
    var newResult;
    if (this_.props.id) {
      newResult = this_.getValue ? this_.getValue(input.clearTemps()) : input.clearTemps();
      oldResult[this_.props.id] = newResult;
    }
    newInputData.result = oldResult;

    return sendData(new InputOption(newInputData));
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

  function sendData(input) {
    var newInput = input.getData();
    newInput.stack = input.stackPop();
    data(new InputOption(newInput));
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
  function doHandleParse() {
    var dataNumber, phraseParseId, newInput;

    //bound to preParseOptions
    function applyLimit(input) {
      var newLimit = input.addLimit(phraseParseId, dataNumber);
      options.addLimit(phraseParseId, this_.props.limit);
      dataNumber++;
      return newLimit;
    }

    newInput = new InputOption(preParseInputData);

    if (this_.props.limit) {
      dataNumber = 0;
      phraseParseId = options.generatePhraseParseId();
    }

    this_._handleParse(newInput, options, applyLimit, sendData, done);
  }

  function doDescribeParse() {
    var lang = getBestElementLang(this_.elements, options.langs);

    preParseInputData.result = {};

    //if describe has never been executed, execute it and cache it
    if (!this_.elements[lang].cache) {
      this_.elements[lang].cache = this_.elements[lang].describe.call(this_);
    }

    this_.elements[lang].cache.parse(new InputOption(preParseInputData), options, phraseData, phraseDone);
  }

  function parseElement() {
    phraseRunning = true;

    //add this to the stack before doing anything
    preParseInputData = input.getData();
    preParseInputData.stack = input.stackPush({
      guid: this_.guid,
      category: this_.props.category
    });

    if (this_._handleParse) {
      doHandleParse();
    } else {
      doDescribeParse();
    }
  }

  //if this is already on the stack, and we've made a suggestion, we need to stop
  // we don't want to cause an infinite loop
  if (
    this.guid > 3 && //do not apply this restriction to the 4 system classes
    input.suggestion.length > 0 &&
    _.find(input.stack, {guid: this.guid})
  ) {
    done();
    return;
  }

  //If it is optional, a branch will skip it entirely
  if (this.props.optional) {
    data(input);
  }

  //Update the extension cache
  this._checkExtensions(options.getExtensions(this.name));

  //Check the extenders - don't call done until all are complete
  asyncEach(Object.keys(this._extenders), function (extender, done) {
    this_._extenders[extender].parse(input, options, sendData, done);
  }, extendersDone);

  //Check the overriders - don't call phrase parse unless none return data
  asyncEach(Object.keys(this._overriders), function (overrider, done) {
    this_._overriders[overrider].parse(input, options, overriderData, done);
  }, overridersDone);
};

module.exports = Phrase;
