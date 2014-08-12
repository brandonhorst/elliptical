(function() {
  var Element, Group,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Element = require('./element');

  Group = (function(_super) {
    __extends(Group, _super);

    function Group(options) {
      Group.__super__.constructor.call(this, options);
    }

    return Group;

  })(Element);

  module.exports = Group;

}).call(this);
