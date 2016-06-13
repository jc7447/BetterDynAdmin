try {
  jQuery(document).ready(function() {
    (function($) {
      console.log('bda.repository.js start');
      try {
        // Plugin constants
        var csts = {
          NAME: 'BetterRepository'
        };
        var defaults = {};
        var settings = {};
        var BDA;
        var methods = {
            // Initialize function, i.e plugin constructor.
            init: function(options) {
              console.log('Init plugin {0}'.format(csts.NAME));

              return this.each(function() {
                var $this = $(this);
                settings = $.extend({}, defaults, options);
                BDA=settings.BDA;
                methods._build($this, settings);
              });
            },
            // PUBLIC FUNCTIONS

            // PRIVATE FUNCTIONS
            _build: function($button, settings) {

            }
          }
          // Plugin entry point

        $.fn.betterRepository = basePlugin(methods, csts.NAME);

      } catch (e) {
        console.log(e);
      }

    })(jQuery);
  });

  console.log('bda.repository.js end');

} catch (e) {
  console.log(e);
}