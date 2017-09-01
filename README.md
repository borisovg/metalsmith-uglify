# metalsmith-uglify

This is an [UglifyJS](http://lisperator.net/uglifyjs/) plugin for [Metalsmith](http://www.metalsmith.io/) and is a successor to the original plugin written by [Keith Smith](https://github.com/ksmithut).

## Usage

Install the package:
```
npm install metalsmith-uglify
```

Add the plugin to your Metalsmith build chain:
```
var metalsmith = require('metalsmith');
var uglify = require('metalsmith-uglify');

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

* {boolean} **`options.es`** -
  Set to use `uglify-es` package instead of `uglify-js`.
  It will set also set `options.uglify.ecma = 6` by default.

* {object} **`options.concat`** -
  Set to concatenate to a single bundle file.
  _UglifyJS does not provide any ordering guarantees._

  - {string} **`options.concat.file`** -
    Name of the bundle file. Default is `scripts.min.js`.

  - {string} **`options.concat.root`** -
    Set to limit the plugin to a specific source directory.
    This option overrides `options.root`.

* {function} **`options.filter`** -
  Function to filter the list of JavaScript files.
  By default `.min.js` files are excluded.

* {string} **`options.root`** -
  Set to limit the plugin to a specific source directory.

* {boolean} **`options.removeOriginal`** -
  Set to keep the original (unminified) file from being included in the output directory.

* {boolean} **`options.sameName`** -
  Set to keep minified name as is without adding `.min`.
  This option overrides `options.removeOriginal` and is ignored if `options.concat` is set.

* {object} **`options.uglify`** -
  UglifyJS configuration (see [UglifyJS docs](https://github.com/mishoo/UglifyJS2#minify-options)).
  Default is `{ sourceMap: { includeSources: true } }`.

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
```
DEBUG=metalsmith-uglify:* node build.js
```
