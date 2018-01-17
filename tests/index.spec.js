/*jshint mocha:true*/
'use strict';

/**
* Tests for index.js
*
* @author George Borisov <git@gir.me.uk>
* @copyright George Borisov 2017
* @license LGPL-3.0
*/

var expect = require('chai').expect;
var subject = require('../index.js');

function make_files () {
    var contents = {
        'js1/foo.js': 'var foo = "foo"; console.log(foo);',
        'js1/bar.js': 'var bar = "bar"; console.log(bar);',
        'js2/baz.js': 'var baz = "baz"; console.log(baz);',
        'js2/other.min.js': 'var other = "other"; console.log(other);',
    };
    var files = {
        // tests that non HTML / CSS file is ignored
        'foo.png': {},
    };

    Object.keys(contents).forEach(function (name) {
        files[name] = {
            contents: new Buffer(contents[name]),
            contentsRaw: contents[name],
            path: name
        };
    });

    return files;
}

describe('index.js', function () {
    it('return a function', function () {
        expect(typeof subject()).to.equal('function');
    });

    it('sets default options', function () {
        var opts = {};
        subject(opts);
        expect(Object.keys(opts).length).to.equal(1);
        expect(Object.keys(opts.uglify).length).to.equal(1);
        expect(Object.keys(opts.uglify.sourceMap).length).to.equal(1);
        expect(opts.uglify.sourceMap.includeSources).to.equal(true);
    });

    it('minifies files and creates source map', function (done) {
        var files = make_files();
        var plugin = subject();

        plugin(files, undefined, function () {
            expect(typeof files['js1/foo.min.js']).to.equal('object');
            expect(typeof files['js1/foo.min.js.map']).to.equal('object');
            expect(typeof files['js1/bar.min.js']).to.equal('object');
            expect(typeof files['js1/bar.min.js.map']).to.equal('object');
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            expect(typeof files['js2/baz.min.js.map']).to.equal('object');

            var map = JSON.parse(files['js1/foo.min.js.map'].contents.toString());

            expect(map.file).to.equal('foo.min.js');
            expect(map.sources.length).to.equal(1);
            expect(map.sourcesContent.length).to.equal(1);
            expect(map.sources[0]).to.equal('js1/foo.js');
            expect(map.sourcesContent[0]).to.equal(files['js1/foo.js'].contentsRaw);

            done();
        });
    });

    it('respects options.filter', function (done) {
        var files = make_files();
        var plugin = subject({
            concat: {},
            filter: function () {
                return false;
            }
        });

        plugin(files, undefined, function () {
            expect(files['js1/foo.min.js']).to.equal(undefined);
            done();
        });
    });

    it('respects options.root', function (done) {
        var files = make_files();
        var plugin = subject({ root: 'js2/' });

        plugin(files, undefined, function () {
            expect(files['js1/foo.min.js']).to.equal(undefined);
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            expect(typeof files['js2/baz.min.js.map']).to.equal('object');
            done();
        });
    });

    it('concatenates files', function (done) {
        var files = make_files();
        var plugin = subject({ concat: {} });

        plugin(files, undefined, function () {
            expect(typeof files['scripts.min.js']).to.equal('object');
            expect(typeof files['scripts.min.js.map']).to.equal('object');
            expect(files['js1/foo.min.js']).to.equal(undefined);
            expect(files['js1/foo.min.js.map']).to.equal(undefined);

            var map = JSON.parse(files['scripts.min.js.map'].contents.toString());

            expect(map.file).to.equal('scripts.min.js');
            expect(map.sources.length).to.equal(3);
            expect(map.sourcesContent.length).to.equal(3);

            ['js1/foo', 'js1/bar', 'js2/baz'].forEach(function (base, idx) {
                var name = base + '.js';
                expect(map.sources[idx]).to.equal(name);
                expect(map.sourcesContent[idx]).to.equal(files[name].contentsRaw);
            });

            done();
        });
    });

    it('includes minified files in bundle with custom filter', function (done) {
        var files = make_files();
        var plugin = subject({
            concat: {
                file: 'bundle.min.js',
                root: 'js2'
            },
            filter: function (name) {
                return name.match(/\.js$/);
            }
        });

        plugin(files, undefined, function () {
            expect(typeof files['js2/bundle.min.js']).to.equal('object');
            expect(typeof files['js2/bundle.min.js.map']).to.equal('object');

            var map = JSON.parse(files['js2/bundle.min.js.map'].contents.toString());

            expect(map.file).to.equal('bundle.min.js');
            expect(map.sources.length).to.equal(2);
            expect(map.sourcesContent.length).to.equal(2);

            ['js2/baz', 'js2/other.min'].forEach(function (base, idx) {
                var name = base + '.js';
                expect(map.sources[idx]).to.equal(name);
                expect(map.sourcesContent[idx]).to.equal(files[name].contentsRaw);
            });

            done();
        });
    });

    it('respects opts.concat.root', function (done) {
        var files = make_files();
        var plugin = subject({ concat: { root: 'js1' } });

        plugin(files, undefined, function () {
            expect(typeof files['js1/scripts.min.js']).to.equal('object');
            expect(typeof files['js1/scripts.min.js.map']).to.equal('object');
            expect(files['js1/foo.min.js']).to.equal(undefined);
            expect(files['js1/foo.min.js.map']).to.equal(undefined);

            var map = JSON.parse(files['js1/scripts.min.js.map'].contents.toString());

            expect(map.file).to.equal('scripts.min.js');
            expect(map.sources.length).to.equal(2);
            expect(map.sourcesContent.length).to.equal(2);

            ['js1/foo', 'js1/bar'].forEach(function (base, idx) {
                var name = base + '.js';
                expect(map.sources[idx]).to.equal(name);
                expect(map.sourcesContent[idx]).to.equal(files[name].contentsRaw);
            });

            done();
        });
    });

    it('respects opts.concat.file', function (done) {
        var files = make_files();
        var plugin = subject({ concat: { file: 'bundle.min.js', root: 'js1' } });

        plugin(files, undefined, function () {
            expect(typeof files['js1/bundle.min.js']).to.equal('object');
            expect(typeof files['js1/bundle.min.js.map']).to.equal('object');
            expect(files['js1/scripts.min.js']).to.equal(undefined);

            var map = JSON.parse(files['js1/bundle.min.js.map'].contents.toString());

            expect(map.file).to.equal('bundle.min.js');
            expect(map.sources.length).to.equal(2);
            expect(map.sourcesContent.length).to.equal(2);

            ['js1/foo', 'js1/bar'].forEach(function (base, idx) {
                var name = base + '.js';
                expect(map.sources[idx]).to.equal(name);
                expect(map.sourcesContent[idx]).to.equal(files[name].contentsRaw);
            });

            done();
        });
    });

    it('respects options.removeOriginal', function (done) {
        var files = make_files();
        var plugin = subject({ removeOriginal: true, root: 'js2' });

        plugin(files, undefined, function () {
            expect(files['js2/baz.js']).to.equal(undefined);
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            done();
        });
    });

    it('respects options.sameName', function (done) {
        var files = make_files();
        var plugin = subject({ sameName: true, root: 'js2' });

        plugin(files, undefined, function () {
            expect(typeof files['js2/baz.js']).to.equal('object');
            expect(typeof files['js2/baz.js.map']).to.equal('object');
            expect(files['js2/baz.min.js']).to.equal(undefined);
            expect(files['js2/baz.min.js.map']).to.equal(undefined);
            done();
        });
    });

    it('allows user to override map creation', function (done) {
        var files = make_files();
        var plugin = subject({ root: 'js2', uglify: { sourceMap: false } });

        plugin(files, undefined, function () {
            expect(files['js1/foo.min.js']).to.equal(undefined);
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            expect(files['js2/baz.min.js.map']).to.equal(undefined);
            done();
        });
    });

    it('respects options.es', function (done) {
        var files = make_files();
        var plugin = subject({ es: true });

        plugin(files, undefined, function () {
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            expect(typeof files['js2/baz.min.js.map']).to.equal('object');
            done();
        });
    });

    it('handles errors in a useful way', function () {
        var files = {
            'broken.js': {
                contents: new Buffer('function spanner () {')
            }
        };
        var plugin = subject();

        try {
            plugin(files);
        } catch (e) {
            expect(e.message.indexOf('broken.js') !== -1);
        }
    });
});
