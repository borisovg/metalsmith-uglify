/*jshint mocha:true*/
"use strict";

/**
 * Tests for index.js
 *
 * @author George Borisov <git@gir.me.uk>
 * @copyright George Borisov 2017
 * @license LGPL-3.0
 */

const { strictEqual } = require("assert");
const subject = require("./index.js");

const testFiles = {
  "js1/foo.js": 'const foo = "foo"; console.log(foo);',
  "js1/bar.js": 'const bar = "bar"; console.log(bar);',
  "js2/baz.js": 'const baz = "baz"; console.log(baz);',
  "js2/other.min.js": 'const other = "other"; console.log(other);',
};

function make_files(contents) {
  const files = {
    // tests that non HTML / CSS file is ignored
    "foo.png": {},
  };

  contents = contents || testFiles;

  Object.keys(contents).forEach(function (name) {
    files[name] = {
      contents: new Buffer.from(contents[name]),
      contentsRaw: contents[name],
      path: name,
    };
  });

  return files;
}

describe("index.js", function () {
  it("return a function", function () {
    strictEqual(typeof subject(), "function");
  });

  it("sets default options", function () {
    const opts = {};
    subject(opts);
    strictEqual(Object.keys(opts).length, 1);
    strictEqual(Object.keys(opts.uglify).length, 1);
    strictEqual(Object.keys(opts.uglify.sourceMap).length, 1);
    strictEqual(opts.uglify.sourceMap.includeSources, true);
  });

  it("minifies files and creates source map", function (done) {
    const files = make_files();
    const plugin = subject();

    plugin(files, undefined, function () {
      strictEqual(typeof files["js1/foo.min.js"], "object");
      strictEqual(typeof files["js1/foo.min.js.map"], "object");
      strictEqual(typeof files["js1/bar.min.js"], "object");
      strictEqual(typeof files["js1/bar.min.js.map"], "object");
      strictEqual(typeof files["js2/baz.min.js"], "object");
      strictEqual(typeof files["js2/baz.min.js.map"], "object");

      const map = JSON.parse(files["js1/foo.min.js.map"].contents.toString());

      strictEqual(map.file, "foo.min.js");
      strictEqual(map.sources.length, 1);
      strictEqual(map.sourcesContent.length, 1);
      strictEqual(map.sources[0], "js1/foo.js");
      strictEqual(map.sourcesContent[0], files["js1/foo.js"].contentsRaw);

      done();
    });
  });

  it("respects options.filter", function (done) {
    const files = make_files();
    const plugin = subject({
      concat: {},
      filter: function () {
        return false;
      },
    });

    plugin(files, undefined, function () {
      strictEqual(files["js1/foo.min.js"], undefined);
      done();
    });
  });

  it("respects options.root", function (done) {
    const files = make_files();
    const plugin = subject({ root: "js2/" });

    plugin(files, undefined, function () {
      strictEqual(files["js1/foo.min.js"], undefined);
      strictEqual(typeof files["js2/baz.min.js"], "object");
      strictEqual(typeof files["js2/baz.min.js.map"], "object");
      done();
    });
  });

  it("concatenates files", function (done) {
    const files = make_files();
    const plugin = subject({ concat: {} });

    plugin(files, undefined, function () {
      strictEqual(typeof files["scripts.min.js"], "object");
      strictEqual(typeof files["scripts.min.js.map"], "object");
      strictEqual(files["js1/foo.min.js"], undefined);
      strictEqual(files["js1/foo.min.js.map"], undefined);

      const map = JSON.parse(files["scripts.min.js.map"].contents.toString());

      strictEqual(map.file, "scripts.min.js");
      strictEqual(map.sources.length, 3);
      strictEqual(map.sourcesContent.length, 3);

      ["js1/foo", "js1/bar", "js2/baz"].forEach(function (base, idx) {
        const name = base + ".js";
        strictEqual(map.sources[idx], name);
        strictEqual(map.sourcesContent[idx], files[name].contentsRaw);
      });

      done();
    });
  });

  it("includes minified files in bundle with custom filter", function (done) {
    const files = make_files();
    const plugin = subject({
      concat: {
        file: "bundle.min.js",
        root: "js2",
      },
      filter: function (name) {
        return name.match(/js2\/.+\.js$/);
      },
    });

    plugin(files, undefined, function () {
      strictEqual(typeof files["js2/bundle.min.js"], "object");
      strictEqual(typeof files["js2/bundle.min.js.map"], "object");

      const map = JSON.parse(
        files["js2/bundle.min.js.map"].contents.toString()
      );

      strictEqual(map.file, "bundle.min.js");
      strictEqual(map.sources.length, 2);
      strictEqual(map.sourcesContent.length, 2);

      ["js2/baz", "js2/other.min"].forEach(function (base, idx) {
        const name = base + ".js";
        strictEqual(map.sources[idx], name);
        strictEqual(map.sourcesContent[idx], files[name].contentsRaw);
      });

      done();
    });
  });

  it("concatenates files listed in opts.files in the order given", function () {
    const files = make_files({
      "js1/foo.js": "console.log(foo.bar);",
      "js1/bar.js": '(function () { foo = { bar: "foobar" }; }());',
    });
    const plugin = subject({
      concat: { root: "js1" },
      files: ["js1/bar.js", "js1/foo.js"],
    });

    plugin(files, undefined, function () {
      strictEqual(typeof files["js1/scripts.min.js"], "object");
      strictEqual(typeof files["js1/scripts.min.js.map"], "object");
      strictEqual(files["js1/foo.min.js"], undefined);
      strictEqual(files["js1/foo.min.js.map"], undefined);

      const map = JSON.parse(
        files["js1/scripts.min.js.map"].contents.toString()
      );

      strictEqual(map.file, "scripts.min.js");
      strictEqual(map.sources.length, 2);
      strictEqual(map.sourcesContent.length, 2);

      ["js1/bar", "js1/foo"].forEach(function (base, idx) {
        const name = base + ".js";
        strictEqual(map.sources[idx], name);
        strictEqual(map.sourcesContent[idx], files[name].contentsRaw);
      });
    });
  });

  it("throws error if a file listed in opts.files in not available", function (done) {
    const plugin = subject({ files: ["js1/spanner.js"] });

    try {
      plugin({});
    } catch (e) {
      strictEqual(typeof e.message, "string");
      done();
    }
  });

  it("respects opts.concat.root", function (done) {
    const files = make_files();
    const plugin = subject({ concat: { root: "js1" } });

    plugin(files, undefined, function () {
      strictEqual(typeof files["js1/scripts.min.js"], "object");
      strictEqual(typeof files["js1/scripts.min.js.map"], "object");
      strictEqual(files["js1/foo.min.js"], undefined);
      strictEqual(files["js1/foo.min.js.map"], undefined);

      const map = JSON.parse(
        files["js1/scripts.min.js.map"].contents.toString()
      );

      strictEqual(map.file, "scripts.min.js");
      strictEqual(map.sources.length, 2);
      strictEqual(map.sourcesContent.length, 2);

      ["js1/foo", "js1/bar"].forEach(function (base, idx) {
        const name = base + ".js";
        strictEqual(map.sources[idx], name);
        strictEqual(map.sourcesContent[idx], files[name].contentsRaw);
      });

      done();
    });
  });

  it("respects opts.concat.file", function (done) {
    const files = make_files();
    const plugin = subject({ concat: { file: "bundle.min.js", root: "js1" } });

    plugin(files, undefined, function () {
      strictEqual(typeof files["js1/bundle.min.js"], "object");
      strictEqual(typeof files["js1/bundle.min.js.map"], "object");
      strictEqual(files["js1/scripts.min.js"], undefined);

      const map = JSON.parse(
        files["js1/bundle.min.js.map"].contents.toString()
      );

      strictEqual(map.file, "bundle.min.js");
      strictEqual(map.sources.length, 2);
      strictEqual(map.sourcesContent.length, 2);

      ["js1/foo", "js1/bar"].forEach(function (base, idx) {
        const name = base + ".js";
        strictEqual(map.sources[idx], name);
        strictEqual(map.sourcesContent[idx], files[name].contentsRaw);
      });

      done();
    });
  });

  it("respects options.removeOriginal", function (done) {
    const files = make_files();
    const plugin = subject({ removeOriginal: true, root: "js2" });

    plugin(files, undefined, function () {
      strictEqual(files["js2/baz.js"], undefined);
      strictEqual(typeof files["js2/baz.min.js"], "object");
      done();
    });
  });

  it("respects options.sameName", function (done) {
    const files = make_files();
    const plugin = subject({ sameName: true, root: "js2" });

    plugin(files, undefined, function () {
      strictEqual(typeof files["js2/baz.js"], "object");
      strictEqual(typeof files["js2/baz.js.map"], "object");
      strictEqual(files["js2/baz.min.js"], undefined);
      strictEqual(files["js2/baz.min.js.map"], undefined);
      done();
    });
  });

  it("allows user to override map creation", function (done) {
    const files = make_files();
    const plugin = subject({ root: "js2", uglify: { sourceMap: false } });

    plugin(files, undefined, function () {
      strictEqual(files["js1/foo.min.js"], undefined);
      strictEqual(typeof files["js2/baz.min.js"], "object");
      strictEqual(files["js2/baz.min.js.map"], undefined);
      done();
    });
  });

  it("respects options.es", function (done) {
    const files = make_files();
    const plugin = subject({ es: true });

    plugin(files, undefined, function () {
      strictEqual(typeof files["js2/baz.min.js"], "object");
      strictEqual(typeof files["js2/baz.min.js.map"], "object");
      done();
    });
  });

  it("respects options.windows", function (done) {
    const plugin = subject({ concat: {}, root: "js3", windows: true });
    let files;

    testFiles["js3\\windows.js"] =
      'const other = "windows"; console.log(windows);';
    files = make_files();

    plugin(files, undefined, function () {
      strictEqual(typeof files["js3\\scripts.min.js"], "object");
      done();
    });
  });

  it("handles errors in a useful way", function () {
    const files = {
      "broken.js": {
        contents: new Buffer.from("function spanner () {"),
      },
    };
    const plugin = subject();

    try {
      plugin(files);
    } catch (e) {
      strictEqual(e.message.indexOf("broken.js") !== -1, true);
    }
  });

  it("handles errors in a useful way when options.es is set", function () {
    const files = {
      "broken.js": {
        contents: new Buffer.from("function spanner () {"),
      },
    };
    const plugin = subject({ es: true });

    try {
      plugin(files);
    } catch (e) {
      strictEqual(e.message.indexOf("broken.js") !== -1, true);
    }
  });
});
