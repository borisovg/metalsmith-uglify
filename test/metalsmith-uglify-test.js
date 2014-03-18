'use strict';

var should     = require('should')
  , Metalsmith = require('metalsmith')
  , uglify     = require('../')
  , uglifyAll
  , uglifyNone
  ;

// uglifyAll
// ---------
uglifyAll = function (done) {
  Metalsmith('test/uglify-all')
    .use(uglify())
    .build(function (err) {
      should.not.exist(err);
      // TODO check to see that it built correctly
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
      // TODO check to see that it built correctly
      done();
    });
};

// Tests
// -----
describe('metalsmith-uglify tests', function () {

  describe('Level 1', function () {
    it('should uglify all .js files', uglifyAll);
  });

  describe('Level 2', function () {
    it('should work without any .js files', uglifyNone);
  });

});
