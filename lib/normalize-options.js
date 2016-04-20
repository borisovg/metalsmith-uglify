'use strict';

var path      = require('upath');
var arrify    = require('arrify');
var assign    = require('object-assign');
var minimatch = require('minimatch');
var isString  = require('is-string');
var matchPos  = require('./match-pos');

module.exports = function normalizeOptions(options) {
  options = assign({
    filter: '**/*.js',// string, function, array of strings
    preserveComments: false, // boolean, 'all', 'some', function
    removeOriginal: false, // boolean
    concat: false, // boolean, string
    // TODO inSourceMap: false, // boolean, string ({{dir}}/{{name}}), function
    sourceMap: false, // boolean, string ({{dir}}/{{name}}), function
    output: {}
  }, options);

  options.fromString = true;
  options.order = normalizeOrder(options.order);
  options.filter = normalizeFilter(options.filter);
  options.sourceMap = normalizeSourceMapPath(options.sourceMap);
  // TODO make getMinPath configurable
  options.getMinPath = getMinPath;

  if (options.concat) {
    if (!isString(options.concat)) {
      throw new Error('uglify: options.concat must be falsy or a string');
    }
    options.getMinPath = function () { return options.concat; };
  }

  // https://github.com/terinjokes/gulp-uglify/blob/master/index.js
  if (options.preserveComments === 'all' || options.preserveComments === true) {
    options.output.comments = true;
  } else if (options.preserveComments === 'some') {
    // preserve comments with directives or that start with a bang (!)
    options.output.comments = /^!|@preserve|@license|@cc_on/i;
  } else if (typeof options.preserveComments === 'function') {
    options.output.comments = options.preserveComments;
  }

  return options;
};

function normalizeFilter(filter) {
  // If it's a string, it must be a glob type thing
  if (isString(filter)) {
    return minimatch.filter(filter);
  }
  // If it's a function, pass it directly to the .filter function
  if (typeof filter === 'function') {
    return filter;
  }
  // If it's an array (of strings), then return a filtering function that only
  // returns the files given in the array
  if (Array.isArray(filter)) {
    return function (file) {
      return filter.some(function (pattern) {
        return minimatch(file, pattern);
      });
    };
  }
  return function () { return true; };
}

function normalizeOrder(order) {
  order = arrify(order);
  order.push('**');
  return function (a, b) {
    var result = matchPos(a, order) - matchPos(b, order);

    if (result === 0) {
      result = a.toLowerCase().localeCompare(b.toLowerCase());
    }

    return result;
  };
}

function normalizeSourceMapPath(option) {
  if (!option) { return function () {}; }
  if (option === true) { option = '{{dir}}/{{name}}.map'; }

  if (typeof option === 'function') { return option; }
  if (isString(option)) {
    return function (filepath) {
      var dirname = path.dirname(filepath);
      var filename = path.basename(filepath);
      var replacement = option
        .replace(/\{\{dir\}\}/g, dirname)
        .replace(/\{\{name\}\}/g, filename);
      return path.normalize(replacement);
    };
  }
  return function () {};
}

function getMinPath(filepath) {
  var ext  = path.extname(filepath);
  var base = path.basename(filepath, ext);
  var dir  = path.dirname(filepath);
  return path.join(dir, base + '.min' + ext);
}
