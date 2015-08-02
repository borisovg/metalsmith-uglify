'use strict';

var minimatch = require('minimatch');
var isString  = require('is-string');

module.exports = function createFilter(filter) {
  // If it's a string, it must be a glob type thing
  if (isString(filter)) {
    return minimatch.filter(filter);
  }
  // If it's a function, pass it directly to the .filter function
  else if (typeof filter === 'function') {
    return filter;
  }
  // If it's an array (of strings), then return a filtering function that only
  // returns the files given in the array
  else if (Array.isArray(filter)) {
    return function (file) {
      return filter.indexOf(file) !== -1;
    };
  }
  return function () { return true; };
};
