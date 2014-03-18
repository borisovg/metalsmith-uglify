'use strict';

var should     = require('should')
  , assertDir  = require('assert-dir-equal')
  , Metalsmith = require('metalsmith')
  , fs         = require('fs')
  , uglify     = require('../')
  , isDir
  , uglifyAll
  , uglifyMap
  , preserveComments
  , preserveSomeComments
  , uglifyNone
  , noData
  , uglifyError
  ;

isDir = function (dir) {
  try { fs.statSync(dir).isDirectory(); }
  catch (exception) { return false; }
}

// uglifyAll
// ---------
uglifyAll = function (done) {
  Metalsmith('test/uglify-all')
    .use(uglify())
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/uglify-all/expected', 'test/uglify-all/build');
      done();
    });
};

// uglifyMap
// ---------
uglifyMap = function (done) {
  var options = {
    outSourceMap: true
  };

  Metalsmith('test/uglify-map')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/uglify-map/expected', 'test/uglify-map/build');
      done();
    });
}

// preserveComments
// ----------------
preserveComments = function (done) {
  var options = {
    preserveComments: 'all'
  };

  Metalsmith('test/preserve-comments')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/preserve-comments/expected', 'test/preserve-comments/build');
      done();
    });
};

// preserveSomeComments
// --------------------
preserveSomeComments = function (done) {
  var options = {
    preserveComments: 'some'
  };

  Metalsmith('test/preserve-some-comments')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/preserve-some-comments/expected', 'test/preserve-some-comments/build');
      done();
    });
};

// uglifyNone
// ----------
uglifyNone = function (done) {
  Metalsmith('test/uglify-none')
    .use(uglify())
    .build(function (err) {
      should.not.exists(err);
      assertDir('test/uglify-none/expected', 'test/uglify-none/build');
      done();
    });
};

// noData
// ------
noData = function (done) {
  Metalsmith('test/no-data')
    .use(function (files, metalsmith, done) {
      delete files['scripts/main.js'].contents;
      done();
    })
    .use(uglify())
    .build(function (err) {
      should(err).exist;
      should(err.toString()).be.equal(
        'Error: data for uglify file does not exist: scripts/main.js'
      );
      should(isDir(__dirname + '/no-data/build')).be.equal(false);
      done();
    });
};

// uglifyError
// -----
uglifyError = function (done) {
  Metalsmith('test/uglify-error')
    .use(uglify())
    .build(function (err) {
      should(err).exist;
      should(err.toString()).be.equal(
        'Error: Uglify: Unexpected token: punc (() in scripts/main.js'
      );
      should(isDir(__dirname + '/uglify-error/build')).be.equal(false);
      done();
    });
};

// Tests
// -----
describe('metalsmith-uglify tests', function () {

  describe('Level 1', function () {
    it('should uglify all .js files', uglifyAll);
    it('should use a source map', uglifyMap);
    it('should preserve all comments', preserveComments);
    it('should preserve some comments', preserveSomeComments);
  });

  describe('Level 2', function () {
    it('should work without any .js files', uglifyNone);
    it('should handle data not being passed', noData);
    it('should handle an uglify error', uglifyError);
  });

});
