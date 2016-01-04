export function LaconaError() {
  var temp = Error.apply(this, arguments)
  temp.name = this.name = 'LaconaError'
  this.stack = temp.stack
  this.message = temp.message
}

LaconaError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: LaconaError,
    writable: true,
    configurable: true
  }
})
