export function createElement(constructor, props, ...children) {
  return {
    constructor: constructor,
    props: props,
    children: children
  }
}

export function createFactory(constructor) {
  return createElement.bind(null, constructor)
}
