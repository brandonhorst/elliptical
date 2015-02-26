import _ from 'lodash'

function diffLists(initial, final) {
  return {
    add: _.difference(final, initial),
    remove: _.difference(initial, final)
  }
}

export default function updateList(descriptors, instances, toDescriptor, toInstance) {
  const instanceDescriptors = _.map(instances, toDescriptor)
  const {add, remove} = diffLists(instanceDescriptors, descriptors)
  const removed = _.filter(instances, (value, index) => _.indexOf(remove, instanceDescriptors[index]))
  return removed.concat(_.map(add, toInstance))
}
