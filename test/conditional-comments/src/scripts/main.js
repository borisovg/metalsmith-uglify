(function () {
  // This comment is here to stay
  var func = function (test1, test2) {
    return test1;
  }
  // This comment will stick around
  console.log(func('b'));
  // TODO write a comment that will not appear in the minified version
  return true;
})();
