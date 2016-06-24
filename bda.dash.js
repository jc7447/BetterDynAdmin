// DASH DynAdmin SHell

// ==UserScript==
// @require bda.dash.parser.js
// ==/UserScript==
try {
  jQuery(document).ready(function() {
    (function($) {
      console.log('bda.dash.js start');
      try {

        var templates = {


        };
        var BDA_DASH = {
          build : function()
          {
          },

          a : function(){

          }
        };

        var defaults = {};
        var settings;
        var BDA;

        $.fn.bdaMenu = function(pBDA,options){
          console.log('Init plugin {0}'.format('DASH'));
          settings = $.extend({}, defaults, options);
          BDA=pBDA;
          var toto = BDA_DASH_PARSER;
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