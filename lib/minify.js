'use strict';

var format = require('util').format;
var uglify = require('uglify-js');
var arrify = require('arrify');

module.exports = function minify(files, options) {
  var mangled;
  files = arrify(files);
  var contents = files.map(function (file) {
    return file.contents.toString();
  });
  var paths = files.map(function (file) { return file.path; });

  try {

    mangled = uglify.minify(contents, options);
    mangled.map = processSourceMap(files, mangled.map);
    return mangled;

  } catch (err) {
    return new Error(
      format('uglify: Failed to minify %s: %s', paths.join(', '), err.stack)
    );
  }
};

function processSourceMap(files, map) {
  if (!map) { return null; }
  map = JSON.parse(map);
  map.sourcesContent = [];
  files.forEach(function (file, i) {
    map.sources[i] = file.path;
    map.sourcesContent[i] = file.contents.toString();
  });
  return JSON.stringify(map);
}
