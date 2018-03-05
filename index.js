/*jshint node:true*/
'use strict';

/**
* Metalsmith plugin to uglify JS files
*
* @author George Borisov <git@gir.me.uk>
* @copyright George Borisov 2017
* @license LGPL-3.0
*/

var debug = require('debug');

var logGetJsFiles = debug('metalsmith-uglify:info:get_js_files');
var logCallUglify = debug('metalsmith-uglify:info:call_uglify');
var logCallUglifyDebug = debug('metalsmith-uglify:debug:call_uglify');
var logMain = debug('metalsmith-uglify:info:main');
var logMainDebug = debug('metalsmith-uglify:debug:main');
var logMinify = debug('metalsmith-uglify:info:minify');
var jsRe = new RegExp('.js$');
var jsMinRe = new RegExp('.min.js$');
var separator, uglify;

function get_root (names, opts) {
    var root = '';

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

function get_js_files (files, opts) {
    var list = Object.keys(files);
    var root = get_root([], opts);
    var i, list;

    logGetJsFiles('Root: %s', root || 'undefined');

    if (opts.files) {
        list = opts.files;

        for (i = 0; i < list.length; i += 1) {
            if (!files[list[i]]) {
                throw new Error('File not available: ' + list[i]);
            }
        }

    } else if (opts.filter) {
        list = list.filter(opts.filter);

    } else {
        if (root) {
            list = list.filter(function (name) {
                return (name.indexOf(root) === 0);
            });
        }

        list = list.filter(function (name) {
            return (name.match(jsRe) && !name.match(jsMinRe));
        });
    }

    return list;
}

function get_min_path (root, names, opts) {
    if (opts.concat) {
        return root + ((opts.concat.file) ? opts.concat.file : 'scripts.min.js');
    } else if (opts.sameName) {
        return root + names[0].split(separator).pop();
    } else {
        return root + names[0].split(separator).pop().replace(jsRe, '.min.js');
    }
}

function call_uglify (src, opts) {
    var result = uglify.minify(src, opts);

    if (result.error) {
        logCallUglify('UglifyJS Command: uglify.minify(%O, %O)', src, opts);
        logCallUglify('UglifyJS Error: %O', result.error);
        throw new Error(require('util').format('UglifyJS Error: %j', result.error));
    }

    logCallUglifyDebug('UglifyJS Command: uglify.minify(%O, %O)', src, opts);
    logCallUglifyDebug('Result: %O', result);

    return result;
}

function minify (names, files, opts) {
    if (!names.length) {
        return;
    }

    var root = get_root(names, opts);
    var pathMin = get_min_path(root, names, opts);
    var src = {};
    var i, name, result;

    logMinify('Root: %s', root);
    logMinify('pathMin: %s', pathMin);

    for (i = 0; i < names.length; i += 1) {
        name = names[i].substr(root.length);
        src[names[i]] = files[names[i]].contents.toString();
    }

    if (opts.uglify.sourceMap) {
        var nameMin = pathMin.split(separator).pop();
        var pathMinMap = pathMin + '.map';

        opts.uglify.sourceMap.filename = nameMin;
        opts.uglify.sourceMap.url = nameMin + '.map';

        result = call_uglify(src, opts.uglify);
        files[pathMinMap] = { contents: new Buffer(result.map) };

    } else {
        result = call_uglify(src, opts.uglify);
    }

    files[pathMin] = { contents: new Buffer(result.code) };

    if (opts.removeOriginal && !opts.sameName) {
        for (i = 0; i < names.length; i += 1) {
            delete files[names[i]];
            logMinify('Removed: %s', names[i]);
        }
    }
}

function plugin (opts) {
    opts = opts || {};
    opts.uglify = opts.uglify || {};

    if (opts.es && opts.uglify.ecma === undefined) {
        opts.uglify.ecma = 6;
    }

    // generate source maps by default
    if (opts.uglify.sourceMap === undefined) {
        opts.uglify.sourceMap = {};
    }

    if (opts.uglify.sourceMap && opts.uglify.sourceMap.includeSources === undefined) {
        opts.uglify.sourceMap.includeSources = true;
    }

    separator = (opts.windows) ? '\\' : '/';
    uglify = require((opts.es) ? 'uglify-es' : 'uglify-js');

    return function main (files, metalsmith, done) {
        logMain('Options: %O', opts);
        logMainDebug('Input Files: %O', Object.keys(files));

        var jsFiles = get_js_files(files, opts);
        var i;

        logMain('JS Files: %O', jsFiles);
        logMain('Processing Started');

        if (opts.concat) {
            minify(jsFiles, files, opts);
        } else {
            for (i = 0; i < jsFiles.length; i += 1) {
                minify([jsFiles[i]], files, opts);
            }
        }

        logMain('Processing Finished');

        done();
    };
}

module.exports = plugin;
