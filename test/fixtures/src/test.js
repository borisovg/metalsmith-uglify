(function ($) {

  var plugin = {
    init: function (selector) {
      $(selector).doSomething();
    }
  };

  $(function () {
    plugin.init();
  });

})(jQuery);
