var Element = require('./element');

var inherits = require('inherits');

var Group = function(options) {
  Group.super_.call(this, options);
};

inherits(Group, Element);

module.exports = Group;
