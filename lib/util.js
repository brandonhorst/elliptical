exports.clone = function clone(obj) {
  var target = {};
  for (var i in obj) {
    target[i] = obj[i];
  }
  return target;
};

exports.omit = function omit(obj, prop) {
  var target = exports.clone(obj);
  delete target[prop];
  return target;
};
