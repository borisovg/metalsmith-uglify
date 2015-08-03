'use strict';
/* jshint maxstatements: false */
/* jshint maxlen: false */
/* jshint unused: false */

var fs         = require('fs');
var uglify     = require('../');
var path       = require('path');
var expect     = require('chai').expect;
var Metalsmith = require('metalsmith');

var FIXTURES   = path.join(__dirname, 'fixtures');

describe('metalsmith-uglify', function () {

  it('should uglify all .js files', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify())
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(files).to.be.instanceof(Object);
        expect(files['test.js']).to.be.instanceof(Object);
        expect(files['test.min.js']).to.be.instanceof(Object);
        expect(files['test.js'].contents.length)
          .to.be.greaterThan(files['test.min.js'].contents.length);
        done();
      });
  });

  it('should filter by glob', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        filter: 'dir/**/*.js'
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(Object.keys(files)).to.have.length(4);
        expect(files['dir/test.min.js']).to.be.instanceof(Object);
        done();
      });
  });

  it('should filter by array of filepaths', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        filter: ['test.js']
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(Object.keys(files)).to.have.length(4);
        expect(files['test.min.js']).to.be.instanceof(Object);
        done();
      });
  });

  it('should not filter if odd filter is passed', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        filter: {}
      }))
      .build(function (err, files) {
        expect(err).to.be.instanceof(Error);
        done();
      });
  });

  it('should filter by function', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        filter: function (filepath) {
          return require('path').extname(filepath) === '.js';
        }
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(Object.keys(files)).to.have.length(5);
        expect(files['test.min.js']).to.be.instanceof(Object);
        expect(files['dir/test.min.js']).to.be.instanceof(Object);
        done();
      });
  });

  it('should remove originals', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        removeOriginal: true
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(files).to.be.instanceof(Object);
        expect(files['test.js']).to.be.equal(undefined);
        expect(files['test.min.js']).to.be.instanceof(Object);
        done();
      });
  });

  it('should preserve all comments', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        preserveComments: 'all'
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        var ALL_REGEX = /(%'all'%)/g;
        var origContents = String(files['test.js'].contents);
        var minContents  = String(files['test.min.js'].contents);
        expect(origContents.match(ALL_REGEX))
          .to.be.eql(minContents.match(ALL_REGEX));
        done();
      });
  });

  it('should preserve some comments', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        preserveComments: 'some'
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        var SOME_REGEX = /(%'some'%)/g;
        var origContents = String(files['test.js'].contents);
        var minContents  = String(files['test.min.js'].contents);
        expect(origContents.match(SOME_REGEX))
          .to.be.eql(minContents.match(SOME_REGEX));
        done();
      });
  });

  it('should preserve contents by function', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        preserveComments: function (node, comment) {
          return comment.value.indexOf('custom') !== -1;
        }
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        var CUSTOM_REGEX = /(%'custom'%)/g;
        var origContents = String(files['test.js'].contents);
        var minContents  = String(files['test.min.js'].contents);
        expect(origContents.match(CUSTOM_REGEX))
          .to.be.eql(minContents.match(CUSTOM_REGEX));
        done();
      });
  });

  it('should catch the error gracefully', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        filter: '**/*.jsx'
      }))
      .build(function (err, files) {
        expect(err).to.be.instanceof(Error);
        done();
      });
  });

  it('should build out sourcemaps', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        sourceMap: true
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(files).to.have.keys([
          'err.jsx',
          'test.js',
          'dir/test.js',
          'test.min.js.map',
          'test.min.js',
          'dir/test.min.js.map',
          'dir/test.min.js'
        ]);
        expect(files['test.min.js'].contents.toString())
          .to.contain('//# sourceMappingURL=test.min.js.map');
        fileEquality(files['test.min.js.map'], '1/test.min.js.map');
        fileEquality(files['dir/test.min.js.map'], '1/dir/test.min.js.map');
        done();
      });
  });

  it('should use a function to make the sourcemap function', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        sourceMap: function (filepath) {
          return filepath + '.js2.map';
        }
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(files).to.have.keys([
          'err.jsx',
          'test.js',
          'dir/test.js',
          'test.min.js.js2.map',
          'test.min.js',
          'dir/test.min.js.js2.map',
          'dir/test.min.js'
        ]);
        fileEquality(files['test.min.js.js2.map'], '2/test.min.js.js2.map');
        fileEquality(files['dir/test.min.js.js2.map'], '2/dir/test.min.js.js2.map');
        done();
      });
  });

  it('should use tokenized string', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        sourceMap: 'maps/{{dir}}/{{name}}.map'
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(files).to.have.keys([
          'err.jsx',
          'test.js',
          'dir/test.js',
          'maps/test.min.js.map',
          'test.min.js',
          'maps/dir/test.min.js.map',
          'dir/test.min.js'
        ]);
        fileEquality(files['maps/test.min.js.map'], '3/maps/test.min.js.map');
        fileEquality(files['maps/dir/test.min.js.map'], '3/maps/dir/test.min.js.map');
        done();
      });
  });

  it('should not do anything else is passed as sourcemap', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify({
        sourceMap: {}
      }))
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(files).to.have.keys([
          'err.jsx',
          'test.js',
          'dir/test.js',
          'test.min.js',
          'dir/test.min.js'
        ]);
        done();
      });
  });

});

function fileEquality(file, filepath) {
  var contentsA = file.contents.toString();
  var contentsB = fs.readFileSync(path.join(
    __dirname,
    'fixtures',
    'sourcemap-contents',
    filepath
  ), 'utf8');
  expect(contentsA).to.be.equal(contentsB);
}
