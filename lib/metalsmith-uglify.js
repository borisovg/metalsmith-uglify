'use strict';

var uglify          = require('uglify-js')
  , async           = require('async')
  , path            = require('path')
  , jsFilter        = require('./js-filter')
  , getMinifiedPath = require('./get-minified-path')
  , parseEach
  , plugin
  , processOptions
  , processSourceMap
  ;

plugin = function (options) {
  options = options || {};
  options.fromString = true;
  options.output = options.output || {};
  // This is the function actually used by metalsmith.
  return function (files, metalsmith, done) {
    var fileFilter = options.filter || jsFilter
      , paths      = Object.keys(files).filter(fileFilter)
      ;
    // TODO files could be null by some error of metalsmith of one of it's
    // plugins.
    async.each(paths, parseEach.bind(null, options, files), done);
  };
};

parseEach = function (options, files, filepath, done) {
  var data         = files[filepath]
    , minifiedPath = getMinifiedPath(filepath)
    , uglified
    ;
  if (!data || !data.contents) {
    return done(new Error('data for uglify file does not exist: ' + filepath));
  }

  // Parse the options
  processOptions(options, minifiedPath);

  // mangle
  // Right now, I guess returning an error stops the entire build process in
  // metalsmith.
  try {
    uglified = uglify.minify(String(data.contents), options);
  } catch (e) {
    return done(new Error('Uglify: ' + e.message + ' in ' + filepath));
  }

  // process the source map
  processSourceMap(options, uglified, filepath, files);

  // create the minified file for metalsmith
  files[minifiedPath] = {
    contents: new Buffer(uglified.code)
  };

  done();
};

// See https://github.com/terinjokes/gulp-uglify/blob/master/index.js
processOptions = function (options, minifiedPath) {
  // we don't need the filter anymore. Options get directly put into uglify
  // so we don't have to have extra options that may cause undesired behavior.
  delete options.filter;

  // outSourceMap
  if (options.outSourceMap === true) {
    options.outSourceMap = minifiedPath + '.map';
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
};

processSourceMap = function (options, uglified, filepath, files) {
  if (!options.outSourceMap) { return; }
  var sourceMap = JSON.parse(uglified.map);
  sourceMap.sources = [filepath];
  files[options.outSourceMap] = {
    contents: new Buffer(JSON.stringify(sourceMap))
  };
  uglified.code += '\n//# sourceMappingURL=' + path.basename(sourceMap.file);
};

module.exports = plugin;
