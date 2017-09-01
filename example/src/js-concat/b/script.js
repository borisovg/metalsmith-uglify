/*jshint browser:true*/
/*exported b*/

function b () {
    'use strict';
    var text = 'js-concat/b/script.js\n';

    document.getElementById('output').innerText += 'Hello from ' + text;
}
