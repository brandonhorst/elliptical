exports.substrings = function (inputString) {
  var length = inputString.length;
  var i;
  var result = [];

  for (i=0; i < length; i++) {
    result.push(inputString.slice(0, i + 1));
  }
  return result;
};
