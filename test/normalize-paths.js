'use strict';

/**
 * Normalize metalsmith filenames in files object so that paths use '/' even on Windows
 */
module.exports = function normalizePathsIfNecessaryPlugin(options) {
  let replaceBackslashes = str => str.replace(/\\/g, "/");

  return function normalizePathsIfNecessary(files, metalsmith, done) {
    Object.keys(files).forEach(fileName => {
      let normalizedFileName = replaceBackslashes(fileName);
      if (fileName !== normalizedFileName) {
        files[normalizedFileName] = files[fileName];
        delete files[fileName];
      }
    });
    done();
  }
};