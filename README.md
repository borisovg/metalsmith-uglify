# metalsmith-uglify

[![NPM version](http://img.shields.io/npm/v/metalsmith-uglify.svg)](https://www.npmjs.org/package/metalsmith-uglify)
[![Dependency Status](http://img.shields.io/gemnasium/ksmithut/metalsmith-uglify.svg)](https://gemnasium.com/ksmithut/metalsmith-uglify)
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

Currently, sourcemaps are not supported, but I plan on working that in the
future if it's something that people use. Or even better, a PR would be happily
accepted. If someone is super interested in taking over maintenance, I wouldn't
mind passing on the reigns.

Concatenating and minifying all the .js files is also not supported at the
moment. For now, use
[metalsmith-concat](https://www.npmjs.com/package/metalsmith-concat) to
concatenate, then minify afterward.

## Installation

```bash
$ npm install metalsmith-uglify --save
```

## Usage

By default, it takes all of your javascript files, and produces a `.min.js`
version of it in the same directory.

```javascript
var Metalsmith = require('metalsmith')
  , uglify     = require('metalsmith-uglify')
  ;

Metalsmith(__dirname)
  .use(uglify())
  .build();

```

It also takes in an object hash with options:

- **`options.filter`** (String, Function, Array of Strings) Default `'**/*.js'`

  This is how you filter which files actually get included. You can use a glob
  pattern like the default value, an array of relative filepaths, or a function.
  The function takes in the filepath to the file. Return `true` if it should be
  uglified, `false` if it shouldn't be included.

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
