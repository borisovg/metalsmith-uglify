(function () {
  //! this comment should stay
  // @preserve this comment should also stay
  // @license this comment should stay
  // @cc_on this comment should stay
  // This comment should disappear
  var func = function (test1, test2) {
    return test1;
  }

  console.log(func('b'));
  // This comment should also be gone
  // What about this comment?
  /* This one? */
  return true;
})();
