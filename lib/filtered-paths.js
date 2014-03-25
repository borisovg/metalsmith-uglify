'use strict';

var globule = require('globule')
  , _       = require('lodash')
  , DEFAULT = '**/*.js'
  , filterPaths
  ;

filterPaths = function (files, filter) {
  // TODO is files is undefined, this could throw an error
  var paths = Object.keys(files);
  // if the filter is a string or an array of strings, assume it's a globbing
  // pattern to filter by. Otherwise, check to see if it's a function and we'll
  // filter by that.
  // TODO check to see if it's an array of ONLY strings
  if (_.isString(filter) || _.isArray(filter)) {
    paths = globule.match(filter, paths);
  } else if (_.isFunction(filter)) {
    paths = paths.filter(filter);
  } else {
    paths = globule.match(DEFAULT, paths);
  }
  return paths;
};

module.exports = filterPaths;
