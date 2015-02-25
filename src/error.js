export default class LaconaError extends Error {
  constructor(message) {
    super(`Lacona Error: ${message}`)
  }
}
