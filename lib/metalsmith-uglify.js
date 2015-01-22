'use strict';

var util      = require('util');
var path      = require('path');
var uglify    = require('uglify-js');
var minimatch = require('minimatch');
var defaults  = require('defaults');

module.exports = function metalsmithUglify(options) {

  // Set up the options
  options = defaults(options, {
    filter: '**/*.js',
    removeOriginal: false,
    output: {}
  });

  options.fromString = true;

  // https://github.com/terinjokes/gulp-uglify/blob/master/index.js
  if (options.preserveComments === 'all') {
		options.output.comments = true;
	} else if (options.preserveComments === 'some') {
		// preserve comments with directives or that start with a bang (!)
		options.output.comments = /^!|@preserve|@license|@cc_on/i;
	} else if (typeof options.preserveComments === 'function') {
		options.output.comments = options.preserveComments;
	}

  return function uglify(files, metalsmith, done) {
    Object.keys(files)
      .filter(minimatch.filter(options.filter))
      .map(function (filepath) {

        var mangled = minify(files[filepath], filepath, options);

        if (mangled instanceof Error) { return done(mangled); }

        files[getMinPath(filepath)] = {
          contents: mangled.code
        };

        if (options.removeOriginal) { delete files[filepath]; }

      });

    done();
  };

};

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

function getMinPath(filepath) {
  var ext  = path.extname(filepath);
  var base = path.basename(filepath, ext);
  var dir  = path.dirname(filepath);
  return path.join(dir, base + '.min' + ext);
}
