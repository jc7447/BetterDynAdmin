(function($) {
  var BDA_STORAGE = {

    GMValue_MonoInstance: "monoInstance",
    GMValue_Backup:"backup",
    STORED_CONFIG : "BdaConfiguration",

  build : function()
  {
    console.log("BDA monoInstance mode : " + (GM_getValue(BDA_STORAGE.GMValue_MonoInstance) === true));

    if(GM_getValue(BDA_STORAGE.GMValue_MonoInstance) === true)
      BDA_STORAGE.restoreData(GM_getValue(BDA_STORAGE.GMValue_Backup), false);
  },

  //--- Stored configuration functions  -----------------------------------------------------------------

  getConfigurationValue : function(name)
  {
      return BDA_STORAGE.getStoredConfiguration()[name];
  },

  getStoredArray : function(name)
  {
    var array = BDA_STORAGE.getConfigurationValue(name);
    if(!array)
      array = [];
    return array;
  },
  //  Sorts & uniq & store
  storeUniqueArray : function(name,array,doConcat)
  {
    //also save the tags as "known tags"
    var storedArray ;
    if(doConcat)
    {
      storedArray = BDA_STORAGE.getStoredArray(name);
      storedArray = storedArray.concat(array);
    }
    else
      storedArray = array;

    storedArray = unique(storedArray);
    BDA_STORAGE.storeConfiguration(name,storedArray);
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
    var storedConfig = BDA_STORAGE.getStoredConfiguration();
    storedConfig[name] = value;
    BDA_STORAGE.storeItem(BDA_STORAGE.STORED_CONFIG, JSON.stringify(storedConfig));
  },

  storeItem : function(itemName, itemValue)
  {
    //console.log("Storing item : " + itemName + " : " + itemValue);
    localStorage.setItem(itemName, itemValue);
    if(GM_getValue(BDA_STORAGE.GMValue_MonoInstance) === true)
      GM_setValue(BDA_STORAGE.GMValue_Backup, JSON.stringify(BDA_STORAGE.getData()));
  },

  restoreData : function (data, reloadUI)
  {
    if(data !== undefined)
    {
      try
      {
        var dataObj = JSON.parse(data);
        BDA_STORAGE.storeItem('Components', JSON.stringify(dataObj.components));
        BDA_STORAGE.storeItem('RQLQueries', JSON.stringify(dataObj.queries));
        BDA_STORAGE.storeItem(this.STORED_CONFIG, JSON.stringify(dataObj.configuration));
        if (reloadUI)
          this.reloadData();
      }
      catch (e) {
        console.error("Parsing error:", e);
      }
    }
  },

  getData : function()
  {
    console.log("Getting all data from localstorage");
    var dataObj = {};
    dataObj.components = BDA_STORAGE.getStoredComponents();
    dataObj.queries = BDA_STORAGE.getStoredRQLQueries();
    dataObj.configuration = BDA_STORAGE.getStoredConfiguration();
    return dataObj;
  },


  getToggleObj : function ()
  {
    var toggleObj = localStorage.getItem('toggleObj');
    if (toggleObj && toggleObj.length > 0)
      toggleObj = JSON.parse(toggleObj);
    else
      toggleObj = {};
    return toggleObj;
  },

  storeToggleState : function(toggle, cssState)
  {
    var toggleState = 1;
    if(cssState == "none")
      toggleState = 0;
    var toggleObj = BDA_STORAGE.getToggleObj();
    toggleObj[toggle] = toggleState;
    BDA_STORAGE.storeItem('toggleObj', JSON.stringify(toggleObj));
  },

  getStoredSplitObj : function ()
  {
    return JSON.parse(localStorage.getItem('splitObj'));
  },

  getXmlDef : function(componentPath)
  {
    console.log("Getting XML def for : " + componentPath);
    var timestamp =  Math.floor(Date.now() / 1000);
    var xmlDefMetaData = JSON.parse(localStorage.getItem("XMLDefMetaData"));
    if (!xmlDefMetaData)
      return null;
    if (xmlDefMetaData.componentPath != componentPath || (xmlDefMetaData.timestamp + BDA_STORAGE.xmlDefinitionCacheTimeout) < timestamp)
    {
      console.log("Xml def is outdated or from a different component");
      return null;
    }
    return localStorage.getItem("XMLDefData");
  },

  storeXmlDef : function(componentPath, rawXML)
  {
    console.log("Storing XML def : " + componentPath);
    var timestamp =  Math.floor(Date.now() / 1000);

    localStorage.setItem("XMLDefMetaData", JSON.stringify({componentPath : componentPath, timestamp: timestamp}));
    localStorage.setItem("XMLDefData", rawXML);
  },

  getStoredRQLQueries : function ()
  {
    var rqlQueries;
    var rqlQueriesStr = localStorage.getItem('RQLQueries');
    if (rqlQueriesStr !== null && rqlQueriesStr.length > 0)
      rqlQueries = JSON.parse(rqlQueriesStr);
    else
      rqlQueries = [];
    return rqlQueries;
  },

  storeSplitValue : function ()
  {
    var splitObj = {};
    splitObj.splitValue = $("#splitValue").val();
    splitObj.activeSplit = $("#noSplit").is(':checked');
    BDA_STORAGE.storeItem('splitObj', JSON.stringify(splitObj));
  },

  storeRQLQuery : function (name, query)
  {
    console.log("Try to store : " + name + ", query : " + query);
    var storeQuery = {};
    storeQuery.name = name;
    storeQuery.query = query;
    storeQuery.repo = getComponentNameFromPath(getCurrentComponentPath());
    var rqlQueries = BDA_STORAGE.getStoredRQLQueries();
    rqlQueries.push(storeQuery);
    console.log(rqlQueries);
    BDA_STORAGE.storeItem('RQLQueries', JSON.stringify(rqlQueries));
  },

  deleteRQLQuery : function (index)
  {
    var queries = BDA_STORAGE.getStoredRQLQueries();
    if (queries.length >  index)
    {
      queries.splice(index, 1);
      BDA_STORAGE.storeItem('RQLQueries', JSON.stringify(queries));
    }
  },

  getStoredComponents : function ()
  {
    var storedComp;
    var storedCompStr = localStorage.getItem('Components');
    if (storedCompStr)
      storedComp = JSON.parse(storedCompStr);
    else
      storedComp = [];

    if(storedComp.length > 0 && BDA_TOOLBAR.idsSet(storedComp))
      storedComp = BDA_TOOLBAR.generateCompIds(storedComp);
    return storedComp;
  },


  reloadData : function()
  {
    $().bdaToolbar().reloadToolbar();
    $().bdaRepository().reloadQueryList();
  },


};

  var initalized = false;
  // Jquery plugin creation
  $.fn.bdaStorage = function()
   {
     if (!initalized)
     {
       console.log('Init plugin {0}'.format('bdaconfig'));
       //settings = $.extend({}, defaults, options);
       BDA_STORAGE.build();
       initalized = true;
     }
    return this;
  };

})(jQuery);
