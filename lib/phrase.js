"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var asyncEach = _interopRequire(require("async-each"));

var _ = _interopRequire(require("lodash"));

var InputOption = _interopRequire(require("./input-option"));

var nextTempId = 0;

function getBestElementLang(translations, langs) {
  var baseLangs = _.map(langs, function (lang) {
    return lang.split("_")[0];
  });

  return _.chain(langs).concat(baseLangs).find(function (lang) {
    return translations[lang];
  }).value() || "default";
}

var Phrase = (function () {
  function Phrase(obj, props, factory, guid) {
    _classCallCheck(this, Phrase);

    // set each property on the class object to be a property on this
    _.assign(this, obj);
    _.bindAll(this);

    // store the constructor in case it needs to be cloned (by sequence)
    this.factory = factory;

    // store the guid for recursion checking
    this.guid = guid;

    // set up the translations, or handleParser if it is provided
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

    // set the default props
    this.props = _.defaults(props || {}, this.getDefaultProps());

    // give a _temp id if none was provided - all phrases must have an id
    if (!this.props.id) {
      this.props.id = "_temp" + nextTempId;
      nextTempId++;
    }

    // call onCreate
    this.onCreate();

    this._oldAdditions = [];
    this._applyAdditions();

    // initialize extenders and overriders
    this._extenders = {};
    this._overriders = {};
  }

  _prototypeProperties(Phrase, null, {
    _applyAdditions: {
      value: function _applyAdditions() {
        var _this = this;

        _.forEach(this._oldAdditions, function (name) {
          delete _this[name];
        });

        _.forEach(this.factory.additions, function (value, name) {
          var setName = "set" + name[0].toUpperCase() + name.slice(1);
          _this[name] = value;
          _this[setName] = function (newValue) {
            var arg = {};
            arg[name] = newValue;
            _this.factory._additionsCallback(arg);
          };
        });

        this._oldAdditions = Object.keys(this.factory.additions);
        this._additionsVersion = this.factory._additionsVersion;
      },
      writable: true,
      configurable: true
    },
    getDefaultProps: {

      // noop - can be overridden

      value: function getDefaultProps() {
        return {};
      },
      writable: true,
      configurable: true
    },
    onCreate: {

      // noop - can be overridden

      value: function onCreate() {},
      writable: true,
      configurable: true
    },
    _checkExtensions: {

      // given all extensions (from the parser), make sure our cache is up-to-date
      // if it is not, update it

      value: function _checkExtensions(extensions) {
        var _this = this;

        ;["extenders", "overriders"].forEach(function (name) {
          var cachedExtensions = Object.keys(_this["_" + name]);
          var currentExtensions = Object.keys(extensions[name]);

          var newExtensions = _.difference(currentExtensions, cachedExtensions);
          var removedExtensions = _.difference(cachedExtensions, currentExtensions);

          newExtensions.forEach(function (newExtension) {
            _this["_" + name][newExtension] = extensions[name][newExtension](_this.props);
          });

          removedExtensions.forEach(function (removedExtension) {
            delete _this["_" + name][removedExtension];
          });
        });
      },
      writable: true,
      configurable: true
    },
    parse: {
      value: function parse(input, options, data, done) {
        var _this = this;

        var preParseInputData;
        var oldResultStored = input.result;
        var phraseRunning = false;
        var extendersRunning = true;
        var overridersRunning = true;
        var overriderGotData = false;

        var phraseData = function (input) {
          var newInputData = input.getData();
          var oldResult = _.clone(oldResultStored);
          var newResult = _this.getValue ? _this.getValue(input.clearTemps()) : input.clearTemps();
          oldResult[_this.props.id] = newResult;
          newInputData.result = oldResult;

          return sendData(new InputOption(newInputData));
        };

        var phraseDone = function () {
          phraseRunning = false;
          checkDoneCondition();
        };

        var extendersDone = function () {
          extendersRunning = false;
          checkDoneCondition();
        };

        var checkDoneCondition = function () {
          if (!extendersRunning && !phraseRunning && !overridersRunning) {
            done();
          }
        };

        var sendData = function (input) {
          var newInput = input.getData();
          newInput.stack = input.stackPop();
          data(new InputOption(newInput));
        };

        var overriderData = function (newOption) {
          overriderGotData = true;
          sendData(newOption);
        };

        var overridersDone = function () {
          overridersRunning = false;
          if (!overriderGotData) {
            parseElement();
          } else {
            checkDoneCondition();
          }
        };
        var doHandleParse = function () {
          var dataNumber, phraseParseId, newInput;

          // bound to preParseOptions
          var applyLimit = function (input) {
            var newLimit = input.addLimit(phraseParseId, dataNumber);
            options.addLimit(phraseParseId, _this.props.limit);
            dataNumber++;
            return newLimit;
          };

          newInput = new InputOption(preParseInputData);

          if (_this.props.limit) {
            dataNumber = 0;
            phraseParseId = options.generatePhraseParseId();
          }

          _this._handleParse(newInput, options, applyLimit, sendData, done);
        };

        var doDescribeParse = function () {
          var lang = getBestElementLang(_this.elements, options.langs);

          preParseInputData.result = {};

          // if describe has never been executed, execute it and cache it
          if (_this._additionsVersion !== _this.factory._additionsVersion) {
            _this._applyAdditions();
            _this.elements[lang].cache = null;
          }
          if (!_this.elements[lang].cache) {
            _this.elements[lang].cache = _this.elements[lang].describe.call(_this);
          }

          _this.elements[lang].cache.parse(new InputOption(preParseInputData), options, phraseData, phraseDone);
        };

        var parseElement = function () {
          phraseRunning = true;

          // add this to the stack before doing anything
          preParseInputData = input.getData();
          preParseInputData.stack = input.stackPush({
            guid: _this.guid,
            category: _this.props.category
          });

          if (_this._handleParse) {
            doHandleParse();
          } else {
            doDescribeParse();
          }
        };

        // if this is already on the stack, and we've made a suggestion, we need to stop
        // we don't want to cause an infinite loop
        if (this.guid > 3 && // do not apply this restriction to the 4 system classes
        input.suggestion.length > 0 && _.find(input.stack, { guid: this.guid })) {
          done();
          return;
        }

        // If it is optional, a branch will skip it entirely
        if (this.props.optional) {
          data(input);
        }

        if (this._handleParse) {
          parseElement();
        } else {
          // Update the extension cache
          this._checkExtensions(options.getExtensions(this.name));

          // Check the extenders - don't call done until all are complete
          asyncEach(Object.keys(this._extenders), function (extender, done) {
            _this._extenders[extender].parse(input, options, sendData, done);
          }, extendersDone);

          // Check the overriders - don't call phrase parse unless none return data
          asyncEach(Object.keys(this._overriders), function (overrider, done) {
            _this._overriders[overrider].parse(input, options, overriderData, done);
          }, overridersDone);
        }
      },
      writable: true,
      configurable: true
    }
  });

  return Phrase;
})();

module.exports = Phrase;