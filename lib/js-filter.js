'use strict';

var path   = require('path')
  , JS_EXT = '.js'
  , jsFilter
  ;

jsFilter = function (filepath) {
  return JS_EXT === path.extname(filepath);
};

module.exports = jsFilter;
