(function ($) {
  // %'all'%
  var plugin = {
    init: function (selector) {
      console.log('loaded dir/testz.js');
    }
  };
  //! %'some'% %'all'%
  // @preserve %'some'% %'all'%
  // @license %'some'% %'all'%
  // @cc_on %'some'% %'all'%
  // %'custom'%
  $(function () {
    plugin.init();
  });

})(jQuery);
