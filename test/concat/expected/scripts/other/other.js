(function () {
  var func = function (test1, test2) {
    return test1 + test2;
  };
  console.log('other.js');
  console.log(func('goodbye', 'cruel world'));
})();
