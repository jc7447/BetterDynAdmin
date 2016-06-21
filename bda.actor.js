(function($) {
  var BDA_ACTOR = {
	build : function() 
	{
		
	}
  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaActor = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdaActor'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_ACTOR.build();
    return this;
  };

})(jQuery);