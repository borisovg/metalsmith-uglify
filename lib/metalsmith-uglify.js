'use strict';

var util      = require('util');
var path      = require('path');
var uglify    = require('uglify-js');
var minimatch = require('minimatch');
var assign    = require('object-assign');
var url       = require('url');

module.exports = function metalsmithUglify(options) {

  // Set up the options
  options = assign({
    filter: '**/*.js',
    preserveComments: false,
    removeOriginal: false,
    sourceMap: false,
    output: {}
  }, options);

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

  return function uglify(files, metalsmith, done) {
    // Get all of the relative filepaths
    Object.keys(files)
      // Filter through so we only get the ones that match the filter
      .filter(filter(options.filter))
      // Uglify the given files and add it to the files object
      .map(function (filepath) {
        var minFilePath = getMinPath(filepath);

        var mangleOptions = assign({}, options);

        if (options.sourceMap) {
          mangleOptions.outSourceMap = path.basename(minFilePath + '.map');
        }

        var mangled = minify(files[filepath], filepath, mangleOptions);

        // If there was an uglification error, return the error to done
        if (mangled instanceof Error) { return done(mangled); }

        if (mangled.map) {
          var sourceMap = JSON.parse(mangled.map);
          sourceMap.sources[0] = filepath;
          sourceMap.sourcesContent = [String(files[filepath].contents)];
          files[minFilePath + '.map'] = {
            contents: new Buffer(JSON.stringify(sourceMap))
          };
        }


        // Create the new file
        files[minFilePath] = {
          contents: mangled.code
        };

        // Remove the original if the option was given
        if (options.removeOriginal) { delete files[filepath]; }
      });
    done();
  };

};

/**
 * @function filter
 * @description returns a filter function to be used on an array of filepaths
 *
 * @param {String|String[]|Function} filt - The type of filter and what to
 * filter on. String must be a glob. Array must be an array of Strings which
 * are exact filepaths. Function gets passed directly into the .filter
 * function, so the first argument is the filepath, second, the index, and
 * third, the original array being iterated.
 *
 * @return {Array} The filtered filepaths
 */
function filter(filt) {
  // If it's a string, it must be a glob type thing
  if (typeof filt === 'string' || filt instanceof String) {
    return minimatch.filter(filt);
  }
  // If it's a function, pass it directly to the .filter function
  else if (typeof filt === 'function') {
    return filt;
  }
  // If it's an array (of strings), then return a filtering function that only
  // returns the files given in the array
  else if (Array.isArray(filt)) {
    return function (file) {
      return filt.indexOf(file) !== -1;
    };
  }
  else {
    return function () { return true; };
  }
}

/**
 * @function minify
 * @description minifies the given file with the given options
 *
 * @param {Object} file - The file object to minify. Must have a property named
 * `contents` that is in the form of a String or Buffer.
 * @param {String} filepath - The filepath of the object
 * @param {Object} options - The options to pass to uglify-js
 * @return {Object} object
 * @return {Buffer} object.code - the minified code
 */
function minify(file, filepath, options) {
  var mangled;

  try {
    mangled = uglify.minify(String(file.contents), options);
    mangled.code = new Buffer(mangled.code);
    return mangled;
  } catch (e) {
    return new Error(util.format('Failed to minify %s: %j', filepath, e));
  }
}

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
