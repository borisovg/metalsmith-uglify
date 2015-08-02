'use strict';

var assign = require('object-assign');
var filter = require('./filter');
var minify = require('./minify');
var relative = require('./relative');

module.exports = function metalsmithUglify(options) {

  // Set up the options
  options = assign({
    filter: '**/*.js',// string, function, array of strings
    preserveComments: false, // boolean, 'all', 'some', function
    removeOriginal: false, // boolean
    // TODO concat: false, // boolean, string
    // TODO inSourceMap: false, // boolean, string ({{dir}}/{{name}}), function
    sourceMap: false, // boolean, string ({{dir}}/{{name}}), function
    output: {}
  }, options);

  normalizeOptions(options);

  return function uglify(files, metalsmith, done) {
    var errors = [];

    var jsFiles = Object.keys(files)
      .filter(filter(options.filter))
      .map(function (filepath) {
        return {
          contents: files[filepath].contents,
          path: filepath
        };
      });

    jsFiles.forEach(function (file) {
      var opts = assign({}, options);
      var minPath = getMinPath(file.path);
      var srcMapPath = normalizeSourceMapPath(minPath, opts.sourceMap);

      if (srcMapPath) {
        opts.outSourceMap = relative(minPath, srcMapPath);
      }

      var mangled = minify(file, opts);

      if (mangled instanceof Error) { return errors.push(mangled); }

      if (mangled.map) {
        files[srcMapPath] = { contents: new Buffer(mangled.map) };
      }

      files[minPath] = { contents: new Buffer(mangled.code) };

      if (opts.removeOriginal) { delete files[file.path]; }
    });

    if (errors.length) { return done(errors[0]); }
    done();

  };

};

function normalizeOptions(options) {
  options.fromString = true;

  // https://github.com/terinjokes/gulp-uglify/blob/master/index.js
  if (options.preserveComments === 'all' || options.preserveComments === true) {
    options.output.comments = true;
  } else if (options.preserveComments === 'some') {
    // preserve comments with directives or that start with a bang (!)
    options.output.comments = /^!|@preserve|@license|@cc_on/i;
  } else if (typeof options.preserveComments === 'function') {
    options.output.comments = options.preserveComments;
  }
}

var path = require('path');
var isString = require('is-string');

/**
 * @function getMinPath
 * @description gets the filepath with `.min` right before the file extension.
 * @example
 * 'path/to/test.min.js' === getMinPath('path/to/test.js')
 *
 * @param {String} filepath - The filepath to minify
 * @param {String} The filepath with the .min extension prefix
 */
function getMinPath(filepath) {
  var ext  = path.extname(filepath);
  var base = path.basename(filepath, ext);
  var dir  = path.dirname(filepath);
  return path.join(dir, base + '.min' + ext);
}

function normalizeSourceMapPath(filepath, option) {
  if (!option) { return; }
  if (option === true) { option = filepath + '.map'; }

  if (typeof option === 'function') {
    option = option(filepath);
  } else if (isString(option)) {
    var dirname = path.dirname(filepath) + '/';
    var filename = path.basename(filepath);
    option = option
      .replace(/\{\{dir\}\}/g, dirname)
      .replace(/\{\{name\}\}/g, filename);
  } else { return; }
  return path.normalize(option);
}
