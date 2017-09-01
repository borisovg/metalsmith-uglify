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

var logGetRoot = debug('metalsmith-uglify:info:get_root');
var logMain = debug('metalsmith-uglify:info:main');
var logMinify = debug('metalsmith-uglify:info:minify');
var logMinifyDebug = debug('metalsmith-uglify:debug:minify');
var jsRe = new RegExp('.js$');
var jsMinRe = new RegExp('.min.js$');
var uglify;

function get_root (names, opts) {
    var root = '';

    if (opts.concat && opts.concat.root) {
        root = opts.concat.root;
    } else if (opts.root) {
        root = opts.root;
    } else if (!opts.concat && names.length) {
        root = names[0].split('/').slice(0, -1).join('/');
    }

    if (root && root.substr(-1) !== '/') {
        root += '/';
    }

    logGetRoot('Root: %s', root);

    return root;
}

function get_js_files (files, opts) {
    var root;

    var list = Object.keys(files).filter(function (name) {
        return (name.match(jsRe) && !name.match(jsMinRe));
    });

    if (opts.filter) {
        list = list.filter(opts.filter);

    } else {
        root = get_root([], opts);

        if (root) {
            list = list.filter(function (name) {
                return (name.indexOf(root) === 0);
            });
        }
    }

    return list;
}

function get_min_path (root, names, opts) {
    if (opts.concat) {
        return root + ((opts.concat.file) ? opts.concat.file : 'scripts.min.js');
    } else if (opts.sameName) {
        return root + names[0].split('/').pop();
    } else {
        return root + names[0].split('/').pop().replace(jsRe, '.min.js');
    }
}

function call_uglify (src, opts) {
    var result = uglify.minify(src, opts);

    logCallUglify('Uglify command: uglify.minify(%O, %O)', src, opts);

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

    for (i = 0; i < names.length; i += 1) {
        name = names[i].substr(root.length);
        src[names[i]] = files[names[i]].contents.toString();
    }

    if (opts.uglify.sourceMap) {
        var nameMin = pathMin.split('/').pop();
        var pathMinMap = pathMin + '.map';

        opts.uglify.sourceMap.filename = nameMin;
        opts.uglify.sourceMap.url = nameMin + '.map';

        result = call_uglify(src, opts.uglify);
        files[pathMinMap] = { contents: new Buffer(result.map) };

    } else {
        result = call_uglify(src, opts.uglify);
    }

    files[pathMin] = { contents: new Buffer(result.code) };

    logMinify('Result: %0', result);

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

    logMain('Options: %O', opts);

    uglify = require((opts.es) ? 'uglify-es' : 'uglify-js');

    return function (files, metalsmith, done) {
        var jsFiles = get_js_files(files, opts);
        var i;

        logMain('JS files: %O', jsFiles);
        logMain('Uglify start');

        if (opts.concat) {
            minify(jsFiles, files, opts);
        } else {
            for (i = 0; i < jsFiles.length; i += 1) {
                minify([jsFiles[i]], files, opts);
            }
        }

        logMain('Uglify end');

        done();
    };
}

module.exports = plugin;
