var util = require('util');

function LaconaError(message) {
  Error.call(this);
  this.message = message;
}

util.inherits(LaconaError, Error);

module.exports = LaconaError;
