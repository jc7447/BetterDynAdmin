(function($) {
  "use strict";
  var BDA_COMP_CONFIG = {
    isServiceConfigurationPage : false,
    isPropertyPage:false,

    build : function()
    {
      BDA_COMP_CONFIG.isServiceConfigurationPage = BDA_COMP_CONFIG.isServiceConfigurationPageFct();
      BDA_COMP_CONFIG.isPropertyPage = BDA_COMP_CONFIG.isPropertyPage();

      if (BDA_COMP_CONFIG.isServiceConfigurationPage)
        BDA_COMP_CONFIG.setupServiceConfigurationPage();
      if (BDA_COMP_CONFIG.isPropertyPage)
        BDA_COMP_CONFIG.setupPropertyPage();
    },

    isServiceConfigurationPageFct : function()
    {
      return location.search.indexOf("propertyName=serviceConfiguration") != -1;
    },

    isPropertyPage : function()
    {
      return $('form[method=POST] > input[name=propertyName]').length === 1;
    },

    setupPropertyPage : function()
    {
    //Modify default textarea default POST ISO 8859 to XHR UTF-8 with reload
    var pathname = $(location).attr('pathname');
    var form = $('form[method=POST][action="' + pathname.replace( /(\/)/g, "\\$1" ) + '"]');
    if($('textarea', form).length === 1)
    {
      //I made sure I tool the right form and it has textarea. Now searching for submit button
      var submitBtn = form.find('input[type=submit]');
      submitBtn.attr('type', 'button');
      submitBtn.click(function()
      {
        $.post(
        form.attr('action'), 
        form.serializeArray(),
        function(data)
        {
          location.reload();
        })
      });
    }
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
