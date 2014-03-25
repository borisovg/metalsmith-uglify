'use strict';

var _ = require('lodash')
  , sourceMapIn
  ;

sourceMapIn = function (options, orig) {
  if (!options.outSourceMap) { return false; }
  if (_.isString(options.sourceMapIn) && options.concat) {
    return options.sourceMapIn;
  }
  // TODO support taking in a function.
  // else if (_.isFunction(options.sourceMapIn)) {
  //   return options.sourceMapIn(orig);
  // }
  else {
    return orig;
  }
};

module.exports = sourceMapIn;
