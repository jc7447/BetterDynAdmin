(function($) {
  var BDA_CONFIG = {
	build : function() 
	{
		
	}
  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaconfig = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdaconfig'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_CONFIG.build();
    return this;
  };

})(jQuery);