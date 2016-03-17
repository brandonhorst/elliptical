import {nextSymbol} from './symbols'
export default function traverse (option, element) {
  return element[nextSymbol](option)
}
