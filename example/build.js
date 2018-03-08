/*jshint node:true, esversion:6*/
'use strict';

/**
* Metalsmith build file
*
* @author George Borisov <git@gir.me.uk>
*/

const debug = require('debug');
const htmlMinifier = require('metalsmith-html-minifier');
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown-remarkable');
const metalsmith = require('metalsmith');

// in real life require('metalsmith-uglify')
const uglify = require('../index.js');

const log = debug('metalsmith-uglify:info:example');

log('Build Started');

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
    .use(layouts())
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
            console.error('Build Failed:', err);

        } else {
            log('Build Finished');
        }
    });
