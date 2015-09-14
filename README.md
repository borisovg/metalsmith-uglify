# metalsmith-uglify

[![NPM version](http://img.shields.io/npm/v/metalsmith-uglify.svg)](https://www.npmjs.org/package/metalsmith-uglify)
[![Dependency Status](http://img.shields.io/david/ksmithut/metalsmith-uglify.svg)](https://gemnasium.com/ksmithut/metalsmith-uglify)
[![Dev Dependency Status](http://img.shields.io/david/dev/ksmithut/metalsmith-uglify.svg)](https://gemnasium.com/ksmithut/metalsmith-uglify)
[![Code Climate](http://img.shields.io/codeclimate/github/ksmithut/metalsmith-uglify.svg)](https://codeclimate.com/github/ksmithut/metalsmith-uglify)
[![Build Status](http://img.shields.io/travis/ksmithut/metalsmith-uglify.svg)](https://travis-ci.org/ksmithut/metalsmith-uglify)
[![Coverage Status](http://img.shields.io/coveralls/ksmithut/metalsmith-uglify.svg)](https://coveralls.io/r/ksmithut/metalsmith-uglify)

An UglifyJS plugin for metalsmith

## 1.x

Note that many options have been removed from the plugin. Many of them may come
back in the future, but their inclusion was making it really difficult to
maintain the code. In an effort to simplify usage, and maintainability, I
followed the example of [terinjokes](https://github.com/terinjokes/) in his
[gulp-uglify](https://github.com/terinjokes/gulp-uglify) plugin and made this
plugin do only one thing: uglify.

Concatenating and minifying all the .js files are supported, but source maps are
buggy when doing this. These issues have been brought up with UglifyJS2 several
times and has yet to be resolved. Let me know if [this issue](https://github.com/mishoo/UglifyJS2/issues/581)
or others like it have been resolved, or if you have another way of solving the
issue.

## Installation

```bash
$ npm install metalsmith-uglify --save
```

## Usage

By default, it takes all of your javascript files, and produces a `.min.js`
version of it in the same directory.

```javascript
var Metalsmith = require('metalsmith');
var uglify     = require('metalsmith-uglify');

Metalsmith(__dirname)
  .use(uglify())
  .build();

```

It also takes in an object hash with options:

- **`options.order`** (String, Array of Strings) Default `'**'`

  This is how you would order the files to be processed. This is mostly just
  used with the concat option so you can control the order in which your files
  will be concatenated.

- **`options.filter`** (String, Function, Array of Strings) Default `'**/*.js'`

  This is how you filter which files actually get included. You can use a glob
  pattern like the default value, an array of relative filepaths or glob
  paths,or a function. The function takes in the filepath to the file. Return
  `true` if it should be uglified, `false` if it shouldn't be included.

- **`options.preserveComments`** (Boolean, String, Function) Default: `false`

  The manner in which comments should be preserved.

  Pass in `'all'` or `true` to keep all comments

  Pass in `'some'` to keep comments that start with `!` `@preserve` `@license`
  `@cc_on`

  Pass in a function to conditionally keep comments. Specify your own comment
  preservation function. You will be passed the current node and the current
  comment and are expected to return either true or false.

- **`options.removeOriginal`** (Boolean) Default: `false`

  This will remove the original (unminified) file from the file tree.

- **`options.sourceMap`** (Boolean|String|Function) Default: `false`

  This indicates whether or not you wish to add a source map to the files. If
  you indicate `true`, it will add an additional file to the output, which will
  be named the name of the minified file, plug `.map`. So if you have a file
  named `app.js`, it will be minified to `app.min.js` and the map file will be
  named `app.min.js.map`.

  If you pass a string, it will use that name, but you can also specify tokens
  for dynamic path generation. So in the above example, if you had a file named
  `js/app.js`, it would generate a file named `js/app.min.js`. If you passed
  `'{{dir}}/{{name}}.map'` into the sourcemap options, it would generate the map
  file at `js/app.min.js.map`. If you passed `'maps/{{name}}.map'`, it
  would generate the file at `'maps/app.min.js.map'`.

  If you pass a function, it will be called for each matching file with the path
  of the minified file as it's argument. You need to return the path to the
  source map file to generate.

- **`options.concat`** (Boolean|String) Default: `false`

  Whether or not to concatenate all of matching files into one file. Must either
  be `false` or a string name of the path to save the concatenated file to.

  Note: sourceMaps are buggy and probably won't work. The tests that I ran made
  it seem like the source map was being generated differently than expected. It
  seemed to only generate the source map for the first file that passed through.
  There are several issues open on the [uglify-js repo](https://github.com/mishoo/UglifyJS2),
  so I'll keep my eye out on any progress on this front.

- **`options.output`** (Object) Default: `{}`

  Any additional output options as documented
  [here](http://lisperator.net/uglifyjs/codegen).

- **`options.compress`** (Object)

  Customize compressor options. Pass `false` to skip compression altogether.
  Options for this can be found [here](http://lisperator.net/uglifyjs/compress).

### Other options

Add in any other options that `uglify.minify` can take:
[uglify api](https://github.com/mishoo/UglifyJS2)

## Troubleshooting

Although this is intended to just be a small wrapper around UglifyJS, there
could be some issues with relative filepaths due to the nature of metalsmith
plugins. I have many automated tests running, but to be honest, I hadn't used
metalsmith too much before writing this plugin. I just saw a need that needed
to be filled and filled it.

## Contributing

Pull Requests are welcome! I would just ask that additional tests are written
for each feature added. If you're interested in maintaining the project, let me
know, and we'll get everything switched over.
