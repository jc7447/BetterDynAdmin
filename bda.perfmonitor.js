(function($) {
  var BDA_PERF_MONITOR = {
	build : function() 
	{
		
	}
  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaPerfMonitor = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdaPerfMonitor'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_JDBC.build();
    return this;
  };

})(jQuery);