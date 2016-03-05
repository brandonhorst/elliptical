import _ from 'lodash'

export default function createStore () {
  const items = []
  const subscribers = []

  return {
    subscribe (observer) {
      subscribers.push(observer)

      return {
        unsubscribe () {
          const index = _.findIndex(subscribers, observer)
          subscribers.splice(index, 1)
        }
      }
    },
    register (element) {
      const existing = _.find(items, item => _.isEqual(element, item.element))

      if (existing) {
        return existing.value
      } else {
        const newItem = {element}

        let initialLoad = true
        const subscription = element.type({
          props: element.attributes,
          children: element.children
        }).subscribe({
          next(value) {
            newItem.value = value

            if (!initialLoad) {
              _.forEach(subscribers, observer => {
                observer.next({element, value})
              })
            }
          }
        })
        initialLoad = false

        items.push(newItem)

        return newItem.value
      }
    }
  }
}