"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = createPhrase;

var Phrase = _interopRequire(require("./phrase"));

var LaconaError = _interopRequire(require("./error"));

var _ = _interopRequire(require("lodash"));

var nextGUID = 0;

function createPhraseFactory(obj) {
  var thisId = nextGUID;

  function phraseFactory(props) {
    var phrase = new Phrase(obj, props, phraseFactory, thisId);

    return phrase;
  }

  phraseFactory._additionsVersion = 0;
  phraseFactory.additions = {};

  phraseFactory.setAdditions = function (additions, callback) {
    this.additions = additions;
    this._additionsVersion++;
    this._additionsCallback = callback;
  };

  nextGUID++;

  // set some properties on the factory, so they can be used for
  // extension and precidence
  phraseFactory["extends"] = obj["extends"] || [];
  phraseFactory.overrides = obj.overrides || [];
  phraseFactory.elementName = obj.name;
  phraseFactory.additions = {};

  return phraseFactory;
}

function createPhrase(obj) {
  var workingObj = _.omit(obj, ["translations", "describe"]);
  var hasDefault = false;

  // objects must have a name
  if (!obj.name) {
    throw new LaconaError("Phrase must have a name");
  }

  if (!obj._handleParse) {
    workingObj.translations = obj.translations || [{ langs: ["default"], describe: obj.describe }];

    workingObj.translations.forEach(function (schema) {
      if (!schema.describe) {
        throw new LaconaError("Every phrase must have a describe method, or translations with describe methods");
      }

      if (!schema.langs) {
        throw new LaconaError("Every schema must have a langs property, and array of languages");
      }

      if (schema.langs.indexOf("default") > -1) {
        hasDefault = true;
      }
    });

    if (!hasDefault) {
      throw new LaconaError("Phrase must have a describe method defined for the default language");
    }
  }

  return createPhraseFactory(workingObj);
}