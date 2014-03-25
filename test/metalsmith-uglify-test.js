'use strict';

var should     = require('should')
  , assertDir  = require('assert-dir-equal')
  , metalsmith = require('metalsmith')
  , fs         = require('fs-extra')
  , path       = require('path')
  , uglify     = require('../')
  , isDir
  , uglifyAll
  , uglifyMap
  , preserveComments
  , preserveSomeComments
  , conditionalComments
  , uglifyFilter
  , concat
  , sourceMapName
  , uglifyNone
  , noData
  , uglifyError
  , badFilter
  , dynoSourceMapName
  , sourceMapIn
  ;

isDir = function (dir) {
  try { fs.statSync(dir).isDirectory(); }
  catch (exception) { return false; }
};

// uglifyAll
// ---------
uglifyAll = function (done) {
  metalsmith('test/uglify-all')
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
    sourceMap: true
  };

  metalsmith('test/uglify-map')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/uglify-map/expected', 'test/uglify-map/build');
      done();
    });
};

// preserveComments
// ----------------
preserveComments = function (done) {
  var options = {
    preserveComments: 'all'
  };

  metalsmith('test/preserve-comments')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir(
        'test/preserve-comments/expected',
        'test/preserve-comments/build'
      );
      done();
    });
};

// preserveSomeComments
// --------------------
preserveSomeComments = function (done) {
  var options = {
    preserveComments: 'some'
  };

  metalsmith('test/preserve-some-comments')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir(
        'test/preserve-some-comments/expected',
        'test/preserve-some-comments/build'
      );
      done();
    });
};

// conditionalComments
// -------------------
conditionalComments = function (done) {
  var options = {
    preserveComments: function (node, comment) {
      return comment.value.indexOf('TODO') === -1;
    }
  };

  metalsmith('test/conditional-comments')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir(
        'test/conditional-comments/expected',
        'test/conditional-comments/build'
      );
      done();
    });
};

// uglifyFilter
// ------------
uglifyFilter = function (done) {
  var options = {
    filter: function (filepath) {
      return path.dirname(filepath).indexOf('other-scripts') === -1;
    }
  };

  metalsmith('test/uglify-filter')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/uglify-filter/expected', 'test/uglify-filter/build');
      done();
    });
};

// concat
// ------
concat = function (done) {
  var options = {
    concat: 'scripts/app.min.js',
    sourceMap: true
  };

  metalsmith('test/concat')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/concat/expected', 'test/concat/build');
      done();
    });
};

// sourceMapName
// -------------
sourceMapName = function (done) {
  var options = {
    sourceMap: true,
    sourceMapName: 'scripts/source-map.map',
    concat: 'scripts/app.min.js'
  };

  metalsmith('test/source-map-name')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/source-map-name/expected', 'test/source-map-name/build');
      done();
    });
};

// dynoSourceMapName
// -----------------
dynoSourceMapName = function (done) {
  var options = {
    sourceMap: true,
    sourceMapName: function (name) {
      return name.replace('.map', '.v1.map');
    }
  };

  metalsmith('test/dyno-source-map-name')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir(
        'test/dyno-source-map-name/expected',
        'test/dyno-source-map-name/build'
      );
      done();
    });
};

// sourceMapIn
// -----------
sourceMapIn = function (done) {
  var options = {
    sourceMap: true,
    concat: 'scripts/app.min.js',
    sourceMapIn: 'scripts/main.map',
    filter: 'scripts/main.js'
  };

  metalsmith('test/source-map-in')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/source-map-in/expected', 'test/source-map-in/build');
      done();
    });
};

// uglifyNone
// ----------
uglifyNone = function (done) {
  metalsmith('test/uglify-none')
    .use(uglify())
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/uglify-none/expected', 'test/uglify-none/build');
      done();
    });
};

// noData
// ------
noData = function (done) {
  metalsmith('test/no-data')
    .use(function (files, metalsmith, done) {
      delete files['scripts/main.js'].contents;
      done();
    })
    .use(uglify())
    .build(function (err) {
      should.exist(err);
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
  metalsmith('test/uglify-error')
    .use(uglify())
    .build(function (err) {
      should.exist(err);
      should(err.toString()).be.equal(
        'Error: Uglify: Unexpected token: punc (()'
      );
      should(isDir(__dirname + '/uglify-error/build')).be.equal(false);
      error2();
    });

  function error2() {
    metalsmith('test/uglify-error')
      .use(uglify({
        concat: 'scripts/app.min.js'
      }))
      .build(function (err) {
        should.exist(err);
        should(err.toString()).be.equal(
          'Error: Uglify: Unexpected token: punc (()'
        );
        should(isDir(__dirname + '/uglify-error/build')).be.equal(false);
        done();
      })
  }
};

// badFilter
// ---------
badFilter = function (done) {
  var options = {
    filter: {}
  };

  metalsmith('test/bad-filter')
    .use(uglify(options))
    .build(function (err) {
      should.not.exist(err);
      assertDir('test/bad-filter/expected', 'test/bad-filter/build');
      done();
    });

};

// Tests
// -----
describe('metalsmith-uglify tests', function () {

  before(function () {
    fs.removeSync(__dirname + '/bad-filter/build');
    fs.removeSync(__dirname + '/concat/build');
    fs.removeSync(__dirname + '/conditional-comments/build');
    fs.removeSync(__dirname + '/dyno-source-map-name/build');
    fs.removeSync(__dirname + '/no-data/build');
    fs.removeSync(__dirname + '/preserve-comments/build');
    fs.removeSync(__dirname + '/preserve-some-comments/build');
    fs.removeSync(__dirname + '/source-map-in/build');
    fs.removeSync(__dirname + '/source-map-name/build');
    fs.removeSync(__dirname + '/uglify-all/build');
    fs.removeSync(__dirname + '/uglify-error/build');
    fs.removeSync(__dirname + '/uglify-filter/build');
    fs.removeSync(__dirname + '/uglify-map/build');
    fs.removeSync(__dirname + '/uglify-none/build');
  });

  describe('Level 1', function () {
    it('should uglify all .js files', uglifyAll);
    it('should use a source map', uglifyMap);
    it('should preserve all comments', preserveComments);
    it('should preserve some comments', preserveSomeComments);
    it('should preserve comments conditionally', conditionalComments);
    it('should filter and only minify given js files', uglifyFilter);
    it('should concat all js files', concat);
    it('should use a custom source map name', sourceMapName);
    it('should dynamically rename source maps', dynoSourceMapName);
    it('should utilize an in source map', sourceMapIn);
  });

  describe('Level 2', function () {
    it('should work without any .js files', uglifyNone);
    it('should handle data not being passed', noData);
    it('should handle an uglify error', uglifyError);
    it('should handle a wrong datatype being passed into filter', badFilter);
  });

});
