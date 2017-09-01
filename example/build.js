/*jshint node:true*/
'use strict';

/**
* Metalsmith build file
*
* @author George Borisov <git@gir.me.uk>
*/

var debug = require('debug');
var htmlMinifier = require('metalsmith-html-minifier');
var layouts = require('metalsmith-layouts');
var markdown = require('metalsmith-markdown-remarkable');
var metalsmith = require('metalsmith');

// in real life require('metalsmith-inline-css')
var uglify = require('../index.js');

var log = debug('metalsmith-uglify:info:example');

log('Build started');

metalsmith(__dirname)
    .metadata({
        site: {
            name: 'Example Static Site'
        }
    })
    .source('./src')
    .destination('./public')
    .use(markdown('commonmark', {
        html: true
    }))
    .use(layouts('pug'))
    .use(uglify({
        concat: {
            file: 'bundle.min.js',
            root: 'js-concat'
        },
        removeOriginal: true
    }))
    .use(uglify({ root: 'js' }))
    .use(htmlMinifier())
    .build(function (err) {
        if (err) {
            log('Build failed: %O', err);

        } else {
            log('Build finished');
        }
    });
