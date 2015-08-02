'use strict';

var path = require('path');

module.exports = function relative(from, to) {
  return path.relative(path.dirname(from), to);
};
