module.exports = {
  scope: {
    literal: function(inputString, data, done) {
      'use strict';
      data({
        display: this.display,
        value: this.value
      });
      return done();
    }
  },
  schema: {
    name: 'literal',
    root: {
      type: 'value',
      compute: 'literal',
      id: '@value'
    }
  }
};