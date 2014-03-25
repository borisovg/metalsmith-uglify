# metalsmith-uglify

An UglifyJS plugin for metalsmith

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

### `options.concat` (Boolean, String) Default `false`

Whether or not to concatenate all of the filtered .js files into one minified
file. Pass false or a falsy value to not concatenate, and a string (the filepath
of the file you would like to create) if you want to concatenate. Do not put in
`true`. There is no default name as a default name could conflict with any
number of other generated files from other plugins.

### `options.filter` (String, Function, Array of Strings) Default `'**/*.js'`

This is how you filter which files actually get included. You can use a glob
pattern like the default value, an array of glob patterns, or a function. The
function takes in the filepath to the file. Return `true` if it should be
uglified, `false` if it shouldn't be included.

### `options.sourceMap` (Boolean) Default: `false`

`true` if you want to include the source map, `false` if otherwise

### `options.sourceMapName` (String, Function) Default: `undefined`

The name of the source map to generate. If you use a function, the function
takes the original name as the argument, then you must return what you want the
new name to be.

```javascript
Metalsmith(__dirname)
  .use(uglify({
    sourceMap: true,
    sourceMapName: function (name) {
      return name.replace('.js', '.min.js');
    }
  }))
  .build();
```

If you pass in a string, you must also have the `options.concat` option set. It
doesn't make sense to have all of your javascript files come across separately
and then you have them all output to the same file without the `concat` option.

### `options.sourceMapIn` (String) Default: `undefined`

The path to the generated source map (i.e. CoffeeScript). In the future, a
function type will be supported here.

### `options.includeSources` (Boolean) Default: `false`

Whether or not to include the source content in the source maps

### `options.preserveComments` (Boolean, String, Function) Default: `false`

The manner in which comments should be preserved.

Pass in `'all'` to keep all comments

Pass in `'some'` to keep comments that start with `!` `@preserve` `@license`
`@cc_on`

Pass in a function to conditionally keep comments. Specify your own comment
preservation function. You will be passed the current node and the current
comment and are expected to return either true or false.

### Other options

Add in any other options that `uglify.minify` can take:
[uglify api](https://github.com/mishoo/UglifyJS2)

## Troubleshooting

Although this is intended to just be a small wrapper around UglifyJS, there
could be some issues with relative filepaths due to the nature of metalsmith
plugins. I have many automated tests running, but to be honest, I hadn't used
metalsmith too much before writing this plugin. I just saw a need that needed
to be filled and filled it.

## Caveats

If you look at the dependencies, you may notice that I'm using a fork of
UglifyJS. The reason for this is uglifyjs does the file reading for you, but
with metalsmith, the files have already been read and the contents are passed
into the plugin. See this [pull request](https://github.com/mishoo/UglifyJS2/pull/324)
for more info.

I plan on switching back to the main module for uglifyjs once the maintainer
has time to merge in those pull requests, but for now, we need metalsmith
compatiblity. Feel free to submit PRs to this repo. I'm not too stingy on naming
of options. That's why it's in version 0.0.x because the API is subject to
change.

## Development

This project uses [`gulp`](http://gulpjs.com/) for task automation.

```bash
$ npm install -g gulp
```

Here are the three tasks available to use:

* `gulp hint`: runs all pertinent code against jshint. The rules are the ones
defined in [`.jshintrc`](.jshintrc)

* `gulp test`: runs all tests with
[`mocha`](http://visionmedia.github.io/mocha/) for passing and
[`instanbul`](http://gotwarlost.github.io/istanbul/) for code coverage. It
generates html files showing the code coverage.

* `gulp docs`: builds out all of the documentation using
[`docco`](http://jashkenas.github.io/docco/). Note that you need to have docco
installed (`npm install -g docco`). I at one time at docco part of the dev
dependencies, but now I don't. I may be open to putting it back, but I just
wanted to keep the package as small as possible.

You can also run `npm test`, and it does basically does the same thing as
`gulp test`, but an error will be thrown because it does some more istanbul
stuff to send data to the coverage server. When this project runs through
travis, it also sends coverage data to coveralls.io.

When forking and doing pull requests, work off of the `develop` branch. I won't
be super strict on this, but it's what I would prefer. That way we can keep
`master` clean.
