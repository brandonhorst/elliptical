var Element = require('./element');

var util = require('util');

var Group = function(options) {
  Group.super_.call(this, options);
};

util.inherits(Group, Element);

module.exports = Group;
