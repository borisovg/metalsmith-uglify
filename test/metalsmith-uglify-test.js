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

});
