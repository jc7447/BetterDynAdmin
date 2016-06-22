(function($) {
  var BDA_CONFIG = {
	build : function()
	{

	},

  //--- Stored configuration functions  -----------------------------------------------------------------

  getConfigurationValue : function(name)
  {
      return BDA.getStoredConfiguration()[name];
  },

  getStoredArray : function(name)
  {
    var array = BDA.getConfigurationValue(name);
    if(array === null || array === undefined)
    {
      array = [];
    }
    return array;
  },
  //  Sorts & uniq & store
  storeUniqueArray : function(name,array,doConcat)
  {
    //also save the tags as "known tags"
    var storedArray ;
    if(doConcat)
    {
      storedArray = BDA.getStoredArray(name);
      storedArray = storedArray.concat(array);
    }
    else
      storedArray = array;

    storedArray = BDA.unique(storedArray);
    BDA.storeConfiguration(name,storedArray);
  },

  getStoredConfiguration : function()
  {
    var config;
    var configStr = localStorage.getItem(this.STORED_CONFIG);
    if (configStr !== null && configStr.length > 0)
      config = JSON.parse(configStr);
    else
      config = {};
    return config;
  },

  storeConfiguration : function (name, value)
  {
    console.log("Try to store config: " + name + ", value : " + JSON.stringify(value));
    var storedConfig = this.getStoredConfiguration();
    storedConfig[name] = value;
    BDA.storeItem(this.STORED_CONFIG, JSON.stringify(storedConfig));
  },

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
