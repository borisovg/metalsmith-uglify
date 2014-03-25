'use strict';

var path          = require('path')
  , DEFAULT_ADDON = '.min'
  , getMinifiedPath
  ;

getMinifiedPath = function (filepath, addon) {
  var dirname  = path.dirname(filepath)
    , ext      = path.extname(filepath)
    , basename = path.basename(filepath, ext)
    ;
  addon    = addon || DEFAULT_ADDON;
  return path.join(dirname, basename + addon + ext);
};

module.exports = getMinifiedPath;
