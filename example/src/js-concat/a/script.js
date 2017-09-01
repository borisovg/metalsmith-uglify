/*jshint browser:true*/
/*exported a*/

function a () {
    'use strict';
    var text = 'js-concat/a/script.js\n';

    document.getElementById('output').innerText += 'Hello from ' + text;
}
