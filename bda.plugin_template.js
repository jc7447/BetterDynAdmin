try {
  jQuery(document).ready(function() {
    (function($) {
      console.log('bda.plugin.js start');
      try {
        // Plugin constants
        var csts = {
          NAME: 'PluginName'
        };
        var defaults = {};
        var settings;
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
            _build: function($this, settings) {

            }
          }
          // Plugin entry point

        $.fn.PLUGIN_FUNCTION = basePlugin(methods, csts.NAME);

      } catch (e) {
        console.log(e);
      }

    })(jQuery);
  });

  console.log('bda.plugin.js end');

} catch (e) {
  console.log(e);
}