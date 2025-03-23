/*jshint node:true*/
"use strict";

/**
 * Metalsmith plugin to uglify JS files
 *
 * @author George Borisov <git@gir.me.uk>
 * @copyright George Borisov 2017
 * @license LGPL-3.0
 */

const debug = require("debug");

const logGetJsFiles = debug("metalsmith-uglify:info:get_js_files");
const logCallUglify = debug("metalsmith-uglify:info:call_uglify");
const logCallUglifyDebug = debug("metalsmith-uglify:debug:call_uglify");
const logMain = debug("metalsmith-uglify:info:main");
const logMainDebug = debug("metalsmith-uglify:debug:main");
const logMinify = debug("metalsmith-uglify:info:minify");
const jsRe = new RegExp(".js$");
const jsMinRe = new RegExp(".min.js$");
let separator, uglify;

function get_root(names, opts) {
  let root = "";

  if (opts.concat && opts.concat.root) {
    root = opts.concat.root;
  } else if (opts.root) {
    root = opts.root;
  } else if (!opts.concat && names.length) {
    root = names[0].split(separator).slice(0, -1).join(separator);
  }

  if (root && root.substr(-1) !== separator) {
    root += separator;
  }

  return root;
}

function get_js_files(files, opts) {
  const root = get_root([], opts);
  let list = Object.keys(files);

  logGetJsFiles("Root: %s", root || "undefined");

  if (opts.files) {
    list = opts.files;

    for (let i = 0; i < list.length; i += 1) {
      if (!files[list[i]]) {
        throw new Error("File not available: " + list[i]);
      }
    }
  } else if (opts.filter) {
    list = list.filter(opts.filter);
  } else {
    if (root) {
      list = list.filter(function (name) {
        return name.indexOf(root) === 0;
      });
    }

    list = list.filter(function (name) {
      return name.match(jsRe) && !name.match(jsMinRe);
    });
  }

  return list;
}

function get_min_path(root, names, opts) {
  if (opts.concat) {
    return root + (opts.concat.file ? opts.concat.file : "scripts.min.js");
  } else if (opts.sameName) {
    return root + names[0].split(separator).pop();
  } else {
    return root + names[0].split(separator).pop().replace(jsRe, ".min.js");
  }
}

async function call_uglify(src, opts) {
  let result;

  try {
    result = await uglify.minify(src, opts);
  } catch (e) {
    result.error = e;
  }

  if (result.error) {
    logCallUglify("UglifyJS Command: uglify.minify(%O, %O)", src, opts);
    logCallUglify("UglifyJS Error: %O", result.error);
    throw new Error(require("util").format("UglifyJS Error: %j", result.error));
  }

  logCallUglifyDebug("UglifyJS Command: uglify.minify(%O, %O)", src, opts);
  logCallUglifyDebug("Result: %O", result);

  return result;
}

async function minify(names, files, opts) {
  if (!names.length) {
    return;
  }

  const root = get_root(names, opts);
  const pathMin = get_min_path(root, names, opts);
  const src = {};

  logMinify("Root: %s", root);
  logMinify("pathMin: %s", pathMin);

  for (let i = 0; i < names.length; i += 1) {
    const name = names[i].substr(root.length);
    src[names[i]] = files[names[i]].contents.toString();
  }

  let result;

  if (opts.uglify.sourceMap) {
    const nameMin = pathMin.split(separator).pop();
    const pathMinMap = pathMin + ".map";

    opts.uglify.sourceMap.filename = nameMin;
    opts.uglify.sourceMap.url = nameMin + ".map";

    result = await call_uglify(src, opts.uglify);
    files[pathMinMap] = { contents: new Buffer.from(result.map) };
  } else {
    result = await call_uglify(src, opts.uglify);
  }

  files[pathMin] = { contents: new Buffer.from(result.code) };

  if (opts.removeOriginal && !opts.sameName) {
    for (let i = 0; i < names.length; i += 1) {
      delete files[names[i]];
      logMinify("Removed: %s", names[i]);
    }
  }
}

function plugin(opts) {
  opts = opts || {};
  opts.uglify = opts.uglify || {};

  if (opts.es && opts.uglify.ecma === undefined) {
    opts.uglify.ecma = 6;
  }

  // generate source maps by default
  if (opts.uglify.sourceMap === undefined) {
    opts.uglify.sourceMap = {};
  }

  if (
    opts.uglify.sourceMap &&
    opts.uglify.sourceMap.includeSources === undefined
  ) {
    opts.uglify.sourceMap.includeSources = true;
  }

  separator = opts.windows ? "\\" : "/";
  uglify = require(opts.es ? "terser" : "uglify-js");

  return function main(files, _metalsmith, done) {
    logMain("Options: %O", opts);
    logMainDebug("Input Files: %O", Object.keys(files));

    const jsFiles = get_js_files(files, opts);

    logMain("JS Files: %O", jsFiles);
    logMain("Processing Started");

    const promises = opts.concat
      ? [minify(jsFiles, files, opts)]
      : jsFiles.map((f) => minify([f], files, opts));

    Promise.all(promises)
      .then(() => {
        logMain("Processing Finished");
        done();
      })
      .catch(done);
  };
}

module.exports = plugin;
