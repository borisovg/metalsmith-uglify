'use strict';

var uglify     = require('../');
var path       = require('path');
var expect     = require('expect.js');
var Metalsmith = require('metalsmith');

var FIXTURES   = path.join(__dirname, 'fixtures');

describe('metalsmith-uglify', function () {

  it('should uglify all .js files', function (done) {
    var build = new Metalsmith(FIXTURES)
      .use(uglify())
      .build(function (err, files) {
        if (err) { return done(err); }
        expect(files).to.be.an(Object);
        expect(files['test.js']).to.be.an(Object);
        expect(files['test.min.js']).to.be.an(Object);
        expect(files['test.js'].contents.length)
          .to.be.greaterThan(files['test.min.js'].contents.length);
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
        expect(files).to.be.an(Object);
        expect(files['test.js']).to.be(undefined);
        expect(files['test.min.js']).to.be.an(Object);
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
        expect(err).to.be.an(Error);
        done();
      });
  });

});
