export function LaconaError (message) {
  this.message = message
}

LaconaError.prototype = new Error()
