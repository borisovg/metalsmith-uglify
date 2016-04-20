'use strict';

/**
 * Normalize metalsmith filenames in files object so that paths use '/' even on Windows
 */
module.exports = function normalizePathsIfNecessaryPlugin(options) {
  var replaceBackslashes = function(str) {
    return str.replace(/\\/g, "/");
  }

  return function normalizePathsIfNecessary(files, metalsmith, done) {
    Object.keys(files).forEach(fileName => {
      var normalizedFileName = replaceBackslashes(fileName);
      if (fileName !== normalizedFileName) {
        files[normalizedFileName] = files[fileName];
        delete files[fileName];
      }
    });
    done();
  }
};