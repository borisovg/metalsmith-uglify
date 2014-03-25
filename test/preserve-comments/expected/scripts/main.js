(function () {
  // This comment should stay
  var func = function (test1, test2) {
    return test1;
  }

  console.log(func('b'));
  // This comment should also stay
  // What about this comment?
  /* This one? */
  return true;
})();
