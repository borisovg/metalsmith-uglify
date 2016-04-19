'use strict';

var path = require('upath');

module.exports = function relative(from, to) {
  return path.relative(path.dirname(from), to);
};
