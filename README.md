[![Tests](https://github.com/borisovg/metalsmith-uglify/actions/workflows/tests.yaml/badge.svg)](https://github.com/borisovg/metalsmith-uglify/actions/workflows/tests.yaml)
[![Coverage Status](https://img.shields.io/codecov/c/github/borisovg/metalsmith-uglify/master.svg?style=flat-square)](https://codecov.io/gh/borisovg/metalsmith-uglify/)

# metalsmith-uglify

This is an [UglifyJS](http://lisperator.net/uglifyjs/) plugin for [Metalsmith](http://www.metalsmith.io/) and is a successor to the original plugin written by [Keith Smith](https://github.com/ksmithut).

## Usage

Install the package:

```
npm install metalsmith-uglify
```

Add the plugin to your Metalsmith build chain:

```
const metalsmith = require('metalsmith');
const uglify = require('metalsmith-uglify');

metalsmith(__dirname)
    .source('./src')
    .destination('./public')
    .use(uglify());
    .build(function (err) {
        if (err) {
            throw err;
        }

        console.log('Build complete');
    });
```

## Options

The plugin function accepts a configuration object as the first argument.

- {boolean} **`options.es`** -
  Set to use `terser` package instead of `uglify-js`.
  It will set also set `options.uglify.ecma = 6` by default.

- {object} **`options.concat`** -
  Set to concatenate to a single bundle file.

  - {string} **`options.concat.file`** -
    Name of the bundle file. Default is `scripts.min.js`.

  - {string} **`options.concat.root`** -
    Directory where the bundle file will be placed.
    This option overrides `options.root`.

- {Array[string]} **`options.files`** -
  List of files to be processed.
  If `options.concat` is set, files will be passed to UglifyJS in that order.
  This option is only needed for bundling badly written code (e.g. jQuery) that relies on files being processed in a certain order.
  This option overrides `options.filter`.

- {function} **`options.filter`** -
  Function to filter the list of JavaScript files.
  By default `.min.js` files are excluded.

- {string} **`options.root`** -
  Set to limit the plugin to a specific source directory.

- {boolean} **`options.removeOriginal`** -
  Set to exclude the original (unminified) file from the output directory.

- {boolean} **`options.sameName`** -
  Set to keep minified name as is without adding `.min`.
  This option overrides `options.removeOriginal` and is ignored if `options.concat` is set.

- {object} **`options.uglify`** -
  UglifyJS configuration (see [UglifyJS docs](https://github.com/mishoo/UglifyJS2#minify-options)).
  Default is `{ sourceMap: { includeSources: true } }`.

- {boolean} **`options.windows`** -
  Set this if you are using the plugin on Windows.
  If you are using any of the `root` options, you will need to use `\\` instead of `/` in the path.

## Upgrading from version 1.x

Version 2 is a rewrite of the plugin with significant breaking changes to the options object.

Please refer to the [upgrade document](1to2.md) for more information.

## Example

To build the example page run:

```
make example
```

Inspect files in `example/` for more information.

## Debug Logging

Set the `DEBUG` variable to see what the plugin is doing.

If you are troubleshooting the plugin itself then the following should be enough:

```
DEBUG=metalsmith-uglify:info:* node build.js
```

If you think the problem is actually related to something UglifyJS does then you can get more detail:

```
DEBUG=metalsmith-uglify:* node build.js
```
