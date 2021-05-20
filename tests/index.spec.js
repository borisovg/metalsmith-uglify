/*jshint mocha:true*/
'use strict';

/**
* Tests for index.js
*
* @author George Borisov <git@gir.me.uk>
* @copyright George Borisov 2017
* @license LGPL-3.0
*/

const expect = require('chai').expect;
const subject = require('../index.js');

const testFiles = {
    'js1/foo.js': 'var foo = "foo"; console.log(foo);',
    'js1/bar.js': 'var bar = "bar"; console.log(bar);',
    'js2/baz.js': 'var baz = "baz"; console.log(baz);',
    'js2/other.min.js': 'var other = "other"; console.log(other);'
};

function make_files (contents) {
    const files = {
        // tests that non HTML / CSS file is ignored
        'foo.png': {},
    };

    contents = contents || testFiles;

    Object.keys(contents).forEach(function (name) {
        files[name] = {
            contents: new Buffer.from(contents[name]),
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
        const opts = {};
        subject(opts);
        expect(Object.keys(opts).length).to.equal(1);
        expect(Object.keys(opts.uglify).length).to.equal(1);
        expect(Object.keys(opts.uglify.sourceMap).length).to.equal(1);
        expect(opts.uglify.sourceMap.includeSources).to.equal(true);
    });

    it('minifies files and creates source map', function (done) {
        const files = make_files();
        const plugin = subject();

        plugin(files, undefined, function () {
            expect(typeof files['js1/foo.min.js']).to.equal('object');
            expect(typeof files['js1/foo.min.js.map']).to.equal('object');
            expect(typeof files['js1/bar.min.js']).to.equal('object');
            expect(typeof files['js1/bar.min.js.map']).to.equal('object');
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            expect(typeof files['js2/baz.min.js.map']).to.equal('object');

            const map = JSON.parse(files['js1/foo.min.js.map'].contents.toString());

            expect(map.file).to.equal('foo.min.js');
            expect(map.sources.length).to.equal(1);
            expect(map.sourcesContent.length).to.equal(1);
            expect(map.sources[0]).to.equal('js1/foo.js');
            expect(map.sourcesContent[0]).to.equal(files['js1/foo.js'].contentsRaw);

            done();
        });
    });

    it('respects options.filter', function (done) {
        const files = make_files();
        const plugin = subject({
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
        const files = make_files();
        const plugin = subject({ root: 'js2/' });

        plugin(files, undefined, function () {
            expect(files['js1/foo.min.js']).to.equal(undefined);
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            expect(typeof files['js2/baz.min.js.map']).to.equal('object');
            done();
        });
    });

    it('concatenates files', function (done) {
        const files = make_files();
        const plugin = subject({ concat: {} });

        plugin(files, undefined, function () {
            expect(typeof files['scripts.min.js']).to.equal('object');
            expect(typeof files['scripts.min.js.map']).to.equal('object');
            expect(files['js1/foo.min.js']).to.equal(undefined);
            expect(files['js1/foo.min.js.map']).to.equal(undefined);

            const map = JSON.parse(files['scripts.min.js.map'].contents.toString());

            expect(map.file).to.equal('scripts.min.js');
            expect(map.sources.length).to.equal(3);
            expect(map.sourcesContent.length).to.equal(3);

            ['js1/foo', 'js1/bar', 'js2/baz'].forEach(function (base, idx) {
                const name = base + '.js';
                expect(map.sources[idx]).to.equal(name);
                expect(map.sourcesContent[idx]).to.equal(files[name].contentsRaw);
            });

            done();
        });
    });

    it('includes minified files in bundle with custom filter', function (done) {
        const files = make_files();
        const plugin = subject({
            concat: {
                file: 'bundle.min.js',
                root: 'js2'
            },
            filter: function (name) {
                return name.match(/js2\/.+\.js$/);
            }
        });

        plugin(files, undefined, function () {
            expect(typeof files['js2/bundle.min.js']).to.equal('object');
            expect(typeof files['js2/bundle.min.js.map']).to.equal('object');

            const map = JSON.parse(files['js2/bundle.min.js.map'].contents.toString());

            expect(map.file).to.equal('bundle.min.js');
            expect(map.sources.length).to.equal(2);
            expect(map.sourcesContent.length).to.equal(2);

            ['js2/baz', 'js2/other.min'].forEach(function (base, idx) {
                const name = base + '.js';
                expect(map.sources[idx]).to.equal(name);
                expect(map.sourcesContent[idx]).to.equal(files[name].contentsRaw);
            });

            done();
        });
    });

    it('concatenates files listed in opts.files in the order given', function () {
        const files = make_files({
            'js1/foo.js': 'console.log(foo.bar);',
            'js1/bar.js': '(function () { foo = { bar: "foobar" }; }());',
        });
        const plugin = subject({ concat: { root: 'js1' }, files: ['js1/bar.js', 'js1/foo.js'] });

        plugin(files, undefined, function () {
            expect(typeof files['js1/scripts.min.js']).to.equal('object');
            expect(typeof files['js1/scripts.min.js.map']).to.equal('object');
            expect(files['js1/foo.min.js']).to.equal(undefined);
            expect(files['js1/foo.min.js.map']).to.equal(undefined);

            const map = JSON.parse(files['js1/scripts.min.js.map'].contents.toString());

            expect(map.file).to.equal('scripts.min.js');
            expect(map.sources.length).to.equal(2);
            expect(map.sourcesContent.length).to.equal(2);

            ['js1/bar', 'js1/foo'].forEach(function (base, idx) {
                const name = base + '.js';
                expect(map.sources[idx]).to.equal(name);
                expect(map.sourcesContent[idx]).to.equal(files[name].contentsRaw);
            });
        });
    });

    it('throws error if a file listed in opts.files in not availables', function (done) {
        const plugin = subject({ files: ['js1/spanner.js'] });

        try {
            plugin({});
        } catch (e) {
            expect(typeof e.message).to.equal('string');
            done();
        }
    });

    it('respects opts.concat.root', function (done) {
        const files = make_files();
        const plugin = subject({ concat: { root: 'js1' } });

        plugin(files, undefined, function () {
            expect(typeof files['js1/scripts.min.js']).to.equal('object');
            expect(typeof files['js1/scripts.min.js.map']).to.equal('object');
            expect(files['js1/foo.min.js']).to.equal(undefined);
            expect(files['js1/foo.min.js.map']).to.equal(undefined);

            const map = JSON.parse(files['js1/scripts.min.js.map'].contents.toString());

            expect(map.file).to.equal('scripts.min.js');
            expect(map.sources.length).to.equal(2);
            expect(map.sourcesContent.length).to.equal(2);

            ['js1/foo', 'js1/bar'].forEach(function (base, idx) {
                const name = base + '.js';
                expect(map.sources[idx]).to.equal(name);
                expect(map.sourcesContent[idx]).to.equal(files[name].contentsRaw);
            });

            done();
        });
    });

    it('respects opts.concat.file', function (done) {
        const files = make_files();
        const plugin = subject({ concat: { file: 'bundle.min.js', root: 'js1' } });

        plugin(files, undefined, function () {
            expect(typeof files['js1/bundle.min.js']).to.equal('object');
            expect(typeof files['js1/bundle.min.js.map']).to.equal('object');
            expect(files['js1/scripts.min.js']).to.equal(undefined);

            const map = JSON.parse(files['js1/bundle.min.js.map'].contents.toString());

            expect(map.file).to.equal('bundle.min.js');
            expect(map.sources.length).to.equal(2);
            expect(map.sourcesContent.length).to.equal(2);

            ['js1/foo', 'js1/bar'].forEach(function (base, idx) {
                const name = base + '.js';
                expect(map.sources[idx]).to.equal(name);
                expect(map.sourcesContent[idx]).to.equal(files[name].contentsRaw);
            });

            done();
        });
    });

    it('respects options.removeOriginal', function (done) {
        const files = make_files();
        const plugin = subject({ removeOriginal: true, root: 'js2' });

        plugin(files, undefined, function () {
            expect(files['js2/baz.js']).to.equal(undefined);
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            done();
        });
    });

    it('respects options.sameName', function (done) {
        const files = make_files();
        const plugin = subject({ sameName: true, root: 'js2' });

        plugin(files, undefined, function () {
            expect(typeof files['js2/baz.js']).to.equal('object');
            expect(typeof files['js2/baz.js.map']).to.equal('object');
            expect(files['js2/baz.min.js']).to.equal(undefined);
            expect(files['js2/baz.min.js.map']).to.equal(undefined);
            done();
        });
    });

    it('allows user to override map creation', function (done) {
        const files = make_files();
        const plugin = subject({ root: 'js2', uglify: { sourceMap: false } });

        plugin(files, undefined, function () {
            expect(files['js1/foo.min.js']).to.equal(undefined);
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            expect(files['js2/baz.min.js.map']).to.equal(undefined);
            done();
        });
    });

    it('respects options.es', function (done) {
        const files = make_files();
        const plugin = subject({ es: true });

        plugin(files, undefined, function () {
            expect(typeof files['js2/baz.min.js']).to.equal('object');
            expect(typeof files['js2/baz.min.js.map']).to.equal('object');
            done();
        });
    });

    it('respects options.windows', function (done) {
        const plugin = subject({ concat: {}, root: 'js3', windows: true });
        var files;

        testFiles['js3\\windows.js'] = 'var other = "windows"; console.log(windows);';
        files = make_files();

        plugin(files, undefined, function () {
            expect(typeof files['js3\\scripts.min.js']).to.equal('object');
            done();
        });
    });

    it('handles errors in a useful way', function () {
        const files = {
            'broken.js': {
                contents: new Buffer.from('function spanner () {')
            }
        };
        const plugin = subject();

        try {
            plugin(files);
        } catch (e) {
            expect(e.message.indexOf('broken.js') !== -1);
        }
    });

    it('handles errors in a useful way when options.es is set', function () {
        const files = {
            'broken.js': {
                contents: new Buffer.from('function spanner () {')
            }
        };
        const plugin = subject({ es: true });

        try {
            plugin(files);
        } catch (e) {
            expect(e.message.indexOf('broken.js') !== -1);
        }
    });
});
