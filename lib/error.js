var inherits = require('inherits')

function LaconaError (message) {
  Error.call(this)
  this.message = message
}

inherits(LaconaError, Error)

module.exports = LaconaError
