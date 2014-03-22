'use strict';

var path = require('path')
  , relativePath
  , normalize
  , repeat
  ;

relativePath = function (from) {
  var origFrom = from;
  return function (to) {
    var relative = '';
    from = origFrom.split(path.sep);
    to   = to.split(path.sep);
    normalize(from, to);
    relative += repeat('../', from.length - 1);
    relative += to.join(path.sep);
    return relative;
  };
};

normalize = function (arr1, arr2) {
  while(arr1[0] === arr2[0]) {
    arr1.shift();
    arr2.shift();
  }
};

repeat = function (str, times) {
  return (new Array(times + 1)).join(str);
};

module.exports = relativePath;
