(function() {
  String.prototype.startsWith = function(str) {
    return this.lastIndexOf(str, 0) === 0;
  };

}).call(this);
