'use strict';

var _ = require('lodash')
  , sourceMapName
  ;

sourceMapName = function (options, orig) {
  // return false is the sourceMap option isn't set or is false
  if (!options.sourceMap) { return false; }
  if (_.isString(options.sourceMapName) && !options.concat) {
    return options.sourceMapName;
  } else if (_.isFunction(options.sourceMapName)) {
    return options.sourceMapName(orig);
  } else {
    return orig;
  }
};

module.exports = sourceMapName;
