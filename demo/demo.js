(function() {
  var input, inputs, parser, suggestionFields, _i, _len;

  console.log(lacona);

  parser = new lacona.Parser();

  parser.use({
    root: {
      type: 'choice',
      children: ['test', 'totally', 'tempest']
    },
    sentence: true
  });

  parser.on('data', function(data) {
    var suggestionField, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = suggestionFields.length; _i < _len; _i++) {
      suggestionField = suggestionFields[_i];
      _results.push(suggestionField.innerHTML += lacona.convertToHTML(data));
    }
    return _results;
  }).on('end', function() {});

  inputs = document.getElementsByClassName('input');

  for (_i = 0, _len = inputs.length; _i < _len; _i++) {
    input = inputs[_i];
    input.onkeyup = function() {
      var suggestionField, _j, _len1;
      for (_j = 0, _len1 = suggestionFields.length; _j < _len1; _j++) {
        suggestionField = suggestionFields[_j];
        suggestionField.innerHTML = '';
      }
      return parser.parse(this.value);
    };
  }

  suggestionFields = document.getElementsByClassName('suggestions');

}).call(this);
