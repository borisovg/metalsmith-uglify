'use strict';

var uglify          = require('uglify-js')
  , async           = require('async')
  , _               = require('lodash')
  , getMinifiedPath = require('./get-minified-path')
  , filteredPaths   = require('./filtered-paths')
  , sourceMapName   = require('./source-map-name')
  , sourceMapIn     = require('./source-map-in')
  , relativePath    = require('./relative-path')
  , parse
  , parseEach
  , parseAll
  , plugin
  , processSourceMap
  , uglifyContents
  ;

plugin = function (options) {
  options = options || {};
  // Set the default options
  options = _.defaults(options, {
    output: {},
    mangle: {},
    compress: {},
    beautify: false,
    sourceMap: false,
    sourceMapName: undefined,
    sourceMapIn: undefined,
    sourceMapIncludeSources: false,
    preserveComments: undefined,
    banner: '',
    footer: '',
    filter: '**/*.js',
    concat: false
  });
  // Set the fromString options manually so that we can actuall use it. The
  // problem with using the from string is that the source mapping then needs
  // to have the sources manually put in.
  options.fromString = true;
  // This is the function actually used by metalsmith.
  return function (files, metalsmith, done) {
    // Check to make sure that files is an object. The only case that I can
    // think of where the files parameter isn't an object is if a plugin deletes
    // the files object. That would be bad, but we'll account for it here.
    if (!_.isObject(files)) { return done(); }
    // Get the filtered paths
    var paths = filteredPaths(files, options.filter);
    parse(options, files, paths, done);
    //--// if (options.concat) {
    //--//   parseAll(options, files, paths, done);
    //--// } else {
    //--//   async.each(paths, parseEach.bind(null, options, files), done);
    //--// }
  };
};

parse = function (options, files, filepaths, done) {
  // we don't need this option anymore
  delete options.filter;

  // preserveComments option
  if (options.preserveComments === 'all') {
    options.output.comments = true;
  } else if (options.preserveComments === 'some') {
    options.output.comments = /^!|@preserve|@license|@cc_on/i;
  } else if (_.isFunction(options.preserveComments)) {
    options.output.comments = options.preserveComments;
  }

  // TODO This could probably be a bit more DRY
  if (options.concat) {
    parseAll(options, files, filepaths, done);
  } else {
    async.each(filepaths, parseEach.bind(null, options, files), done);
  }
};

parseAll = function (options, files, filepaths, done) {
  var filesToMinify = []
    , sources       = []
    , filename      = options.concat
    , uglified
    ;

  // Loop through and get an array of all of the file contents as well as the
  // sources to include in the source map (if the sourceMap options was set)
  filepaths.map(function (filepath) {
    filesToMinify.push(String(files[filepath].contents));
    sources.push(filepath);
  });

  options.outSourceMap = sourceMapName(options, filename + '.map');
  options.inSourceMap  = sourceMapIn(options, false);
  // sourceMapIncludeSources is already a part of the options
  if (options.outSourceMap) {
    options.sourcePaths  = sources.map(relativePath(options.outSourceMap));
  }

  uglified = uglifyContents(filesToMinify, options);
  if (uglified instanceof Error) {
    return done(uglified);
  }

  processSourceMap(options, uglified, files, filename);

  files[filename] = {
    contents: new Buffer(uglified.code)
  };

  done();
};

parseEach = function (options, files, filepath, done) {
  // TODO make an option to customize filepath
  var data         = files[filepath]
    , minifiedPath = getMinifiedPath(filepath)
    , uglified
    ;
  if (!data || !data.contents) {
    return done(new Error('data for uglify file does not exist: ' + filepath));
  }

  // Parse the options
  options.outSourceMap = sourceMapName(options, minifiedPath + '.map');
  options.inSourceMap  = sourceMapIn(options, false);
  // sourceMapIncludeSources is already a part of the options
  if (options.outSourceMap) {
    options.sourcePaths  = [filepath].map(relativePath(options.outSourceMap));
  }

  // mangle
  // Right now, I guess returning an error stops the entire build process in
  // metalsmith.
  uglified = uglifyContents(String(data.contents), options);
  if (uglified instanceof Error) {
    return done(uglified);
  }

  // process the source map
  processSourceMap(options, uglified, files, minifiedPath);

  // create the minified file for metalsmith
  files[minifiedPath] = {
    contents: new Buffer(uglified.code)
  };

  done();
};

processSourceMap = function (options, uglified, files, dest) {
  if (!options.outSourceMap) { return; }
  var sourceMappingUrl = relativePath(dest)(options.outSourceMap);
  files[options.outSourceMap] = {
    contents: new Buffer(uglified.map)
  };
  uglified.code += '\n//# sourceMappingURL=' + sourceMappingUrl;
};

uglifyContents = function (code, options) {
  var uglified;
  try {
    uglified = uglify.minify(code, options);
  } catch (e) {
    // TODO make this error more useful
    return new Error('Uglify: ' + e.message);
  }
  return uglified;
};

module.exports = plugin;
