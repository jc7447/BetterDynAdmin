// DASH DynAdmin SHell

try {
  jQuery(document).ready(function() {
    (function($) {
      console.log('bda.dash.js start');
      try {

        var templates = {
          consoleModal : 
            '<div id="dashModal" class="modal fade" tabindex="-1" role="dialog">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title">DASH - DynAdmin SHell</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<p>One fine body&hellip;</p>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
            '<button type="button" class="btn btn-primary">Save changes</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'

        };
        var BDA_DASH = {

          build : function()
          {
              $(templates.consoleModal).insertAfter(BDA.logoSelector).modal('toggle');

          },

          a : function(){

          }
        };

        var defaults = {};
        var parser;
        var settings;
        var BDA;

        $.fn.bdaMenu = function(pBDA,options){
          console.log('Init plugin {0}'.format('DASH'));
          settings = $.extend({}, defaults, options);
          BDA=pBDA;
          parser = BDA_DASH_PARSER;
          BDA_DASH.build();
          return this;
        }

      } catch (e) {
        console.log(e);
      }

    })(jQuery);
  });

  console.log('bda.dash.js end');

} catch (e) {
  console.log(e);
}