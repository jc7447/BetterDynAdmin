(function($) {
  "use strict";
  var BDA_COMP_CONFIG = {
    isServiceConfigurationPage : false,

	build : function()
	{
    BDA_COMP_CONFIG.isServiceConfigurationPage = BDA_COMP_CONFIG.isServiceConfigurationPageFct();

    if (BDA_COMP_CONFIG.isServiceConfigurationPage)
      BDA_COMP_CONFIG.setupServiceConfigurationPage();
	},

  isServiceConfigurationPageFct : function()
  {
    return location.search.indexOf("propertyName=serviceConfiguration") != -1;
  },

  setupServiceConfigurationPage : function()
  {
    console.log("setupServiceConfigurationPage");
    hljs.registerLanguage("properties",
        function(hljs) {
      console.log(hljs);
      return {
        cI: true,
        c: [
           {
             cN: 'comment',
             b: '#',
             e: '$'
           },
           {
             cN: 'setting',
             b: /^[$a-z0-9\[\]_-]+\s*=\s*/,
             e: '$',
             c: [
                 {
                 cN: 'value',
                 eW: !0,
                 c: [
                     {
                       cN: 'number',
                       b: '\\b\\d+(\\.\\d+)?',
                       r: 10
                     },
                     {
                       cN: 'string',
                       b : /[./a-z0-9\[\]_-]+/,
                       e: '$',
                       r: 0
                     }
                    ],
                 r: 0
               }
             ]
           }
        ]
      };
    });
    $('pre').each(function() {
      var txt = $(this).html();
      $(this).text("");
      $("<code class='properties' />").appendTo($(this)).html(txt);

    });
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
  },

  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaCompConfig = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdaCompConfig'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_COMP_CONFIG.build();
    return this;
  };

})(jQuery);
