/*jshint browser:true*/
/*exported b*/

function b() {
  "use strict";
  const text = "js-concat/b/script.js\n";

  document.getElementById("output").innerText += "Hello from " + text;
}
