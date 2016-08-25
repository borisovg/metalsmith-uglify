'use strict';

var format = require('util').format;
var uglify = require('uglify-js');
var arrify = require('arrify');

module.exports = function minify(files, options) {
  var mangled;
  files = arrify(files);
  var contents = {};
  files.forEach(function (file) {
    contents[file.path] = file.contents.toString();
  });
  var paths = files.map(function (file) { return file.path; });

  try {
    mangled = uglify.minify(contents, options);
    return mangled;
  } catch (err) {
    return new Error(
      format('uglify: Failed to minify %s: %s', paths.join(', '), err.stack)
    );
  }
};
