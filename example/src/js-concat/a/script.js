/*jshint browser:true*/
/*exported a*/

function a() {
  "use strict";
  const text = "js-concat/a/script.js\n";

  document.getElementById("output").innerText += "Hello from " + text;
}
