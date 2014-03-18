'use strict';

var uglify   = require('uglify-js')
  , async    = require('async')
  , jsFilter = require('./js-filter')
  , parse
  , plugin
  ;

plugin = function (options) {
  options = options || {};
  // This is the function actually used by metalsmith.
  return function (files, metalsmith, done) {
    var fileFilter = options.filter || jsFilter
      , paths      = Object.keys(files).filter(fileFilter);
      ;
    delete options.filter;
    // TODO files could be null by some error of metalsmith of one of it's
    // plugins.
    async.each(paths, parse.bind(null, options, files), done);
  };
};

parse = function (options, files, path, done) {
  var data = files[path];
  if (!data || !data.contents) {
    return done(new Error('data for uglify file does not exist: ' + path));
  }

  // Parse the options

  // outSourceMap
  if (options.outSourceMap === true) {
		options.outSourceMap = path + '.map';
	}

  // preserveComments
  if (options.preserveComments === 'all') {
		options.output.comments = true;
	} else if (options.preserveComments === 'some') {
		// preserve comments with directives or that start with a bang (!)
		options.output.comments = /^!|@preserve|@license|@cc_on/i;
	} else if (typeof options.preserveComments === 'function') {
		options.output.comments = options.preserveComments;
	}

  // mangle
  try {
    uglified = uglify.minify(String(data), options);
  }

  done();
};

module.exports = plugin;
