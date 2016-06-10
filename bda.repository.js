// ----- JQuery plugin functions -----

// Standard function to create a JQuery plugin entry point.
//
// @param methods Plugin methods.
// @param plugin Plugin name.

jQuery(document).ready(function() {
	(function($) {
		try {

			// Plugin constants
			var csts = {
				NAME: 'BetterRepository'
			};
			var defaults = {
			};

			var methods = {

					// Initialize function, i.e plugin constructor.
					init: function(options) {
						console.log('Init plugin {0}'.format(csts.NAME));

						return this.each(function() {

							var $this = $(this);

							var settings = $.extend({}, defaults, options);
							methods._build($this, settings);
						});
					},

					// PUBLIC FUNCTIONS

					// PRIVATE FUNCTIONS
					_build: function($button, settings) {


				}
				// Plugin entry point

			$.fn.multiStatesButton = basePlugin(methods, csts.NAME);

		} catch (e) {
			console.log(e);
		}

	})(jQuery);
});