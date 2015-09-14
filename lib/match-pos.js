'use strict';

var minimatch = require('minimatch');

module.exports = function matchPos(str, patterns) {
  var pos = -1;
  patterns.some(function (pattern, i) {
    if (minimatch(str, pattern)) {
      pos = i;
      return true;
    }
  });
  return pos;
};
