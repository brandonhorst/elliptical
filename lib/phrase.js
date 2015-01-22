var asyncEach = require('async-each');
var _ = require('lodash');

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
  _.chain(this).assign(obj).bindAll();

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
        acc[lang] = value.describe;
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

Phrase.prototype.parse = function(options, data, done) {
  var preParseOptions;
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
      this_._handleParse(preParseOptions, sendData, done);
    } else {
      lang = getBestElementLang(this_.elements, options.langs);
      newOptions = _.clone(preParseOptions);

      newOptions.input = newOptions.input.replaceResult({});

      if (typeof this_.elements[lang] === 'function') {
        this_.elements[lang] = this_.elements[lang].call(this_);
      }

      this_.elements[lang].parse(newOptions, phraseData, phraseDone);
    }
  }

  //if this is already on the stack, and we've made a suggestion, we need to stop
  // we don't want to cause an infinite loop
  if (
    this.guid > 3 && //do not apply this restriction to the 4 system classes
    options.input.suggestion.length > 0 &&
    _.find(options.input.stack, {guid: this.guid})
  ) {
    done();
    return;
  }

  //add this to the stack before doing anything
  preParseOptions = _.clone(options);
  preParseOptions.input = preParseOptions.input.stackPush({
    id: this.props.id,
    guid: this.guid,
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
