'use strict';

var assign = require('object-assign');
var normalizeOptions = require('./lib/normalize-options');
var minify = require('./lib/minify');
var relative = require('./lib/relative');

module.exports = function metalsmithUglify(options) {

  // Set up the options
  options = normalizeOptions(options);

  return function uglify(files, metalsmith, done) {
    var errors = [];

    var jsFiles = Object.keys(files)
      .filter(options.filter)
      .sort(options.order)
      .map(function (filepath) {
        var contents = files[filepath].contents;
        if (options.removeOriginal) { delete files[filepath]; }
        return {
          contents: contents,
          path: filepath
        };
      });

    if (options.concat && jsFiles.length) { jsFiles = [jsFiles]; }

    jsFiles.forEach(function (file) {
      var opts = assign({}, options);
      var minPath = options.getMinPath(file.path);
      var srcMapPath = options.sourceMap(minPath);

      if (srcMapPath) {
        opts.outSourceMap = relative(minPath, srcMapPath);
      }

      var mangled = minify(file, opts);

      if (mangled instanceof Error) { return errors.push(mangled); }

      if (mangled.map) {
        files[srcMapPath] = { contents: new Buffer(mangled.map) };
      }

      files[minPath] = { contents: new Buffer(mangled.code) };
    });

    if (errors.length) { return done(errors[0]); }
    done();

  };

};
