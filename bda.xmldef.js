(function($) {
  var BDA_XML_DEF = {
	build : function() 
	{
		
	}
  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaXmlDef = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdaXmlDef'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_XML_DEF.build();
    return this;
  };

})(jQuery);