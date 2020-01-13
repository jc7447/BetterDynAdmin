(function($) {
  var BDA_STORAGE = {

    GMValue_MonoInstance: "monoInstance",
    GMValue_Backup:"backup",
    STORED_CONFIG : "BdaConfiguration",
    scripts : 'DashScripts',

  build : function()
  {
    console.time("bdaStorage");
    console.log("BDA monoInstance mode : " + (GM_getValue(BDA_STORAGE.GMValue_MonoInstance) === true));

    if(GM_getValue(BDA_STORAGE.GMValue_MonoInstance) === true)
      BDA_STORAGE.restoreData(GM_getValue(BDA_STORAGE.GMValue_Backup), false);
    console.timeEnd("bdaStorage");
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
    logTrace("Try to store config: " + name + ", value : " + JSON.stringify(value));
    var storedConfig = BDA_STORAGE.getStoredConfiguration();
    storedConfig[name] = value;
    BDA_STORAGE.storeItem(BDA_STORAGE.STORED_CONFIG, JSON.stringify(storedConfig));
  },

  storeItem : function(itemName, itemValue)
  {
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
        BDA_STORAGE.storeItem(this.scripts, JSON.stringify(dataObj.scripts));
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
    logTrace("Getting all data from localstorage");
    var dataObj = {};
    dataObj.components = BDA_STORAGE.getStoredComponents();
    dataObj.queries = BDA_STORAGE.getStoredRQLQueries();
    dataObj.configuration = BDA_STORAGE.getStoredConfiguration();
    dataObj.scripts  =BDA_STORAGE.getScripts();
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

  getQueryByName: function(repo, name) {
    var res = null;
    var shortRepoName =  getComponentNameFromPath(repo);
    var rqlQueries = BDA_STORAGE.getStoredRQLQueries();
    for (var i = 0; i != rqlQueries.length; i++) {
      var query = rqlQueries[i];
      if ( query.repo == shortRepoName && query.name == name) {
        res = query;
      }
    }
    return res;
  },

  storeSplitValue : function ()
  {
    var splitObj = {};
    splitObj.splitValue = $("#splitValue").val();
    splitObj.activeSplit = $("#noSplit").is(':checked');
    BDA_STORAGE.storeItem('splitObj', JSON.stringify(splitObj));
  },

  storeRQLQuery : function (name, query,componentPath)
  {
    console.log("Try to store : " + name + ", query : " + query);
    var storeQuery = {};
    storeQuery.name = name;
    storeQuery.query = query;
    var path = componentPath;
    if(isNull(path)){
      path= getCurrentComponentPath();
    }
    storeQuery.repo = getComponentNameFromPath(path);
    var rqlQueries = BDA_STORAGE.getStoredRQLQueries();
    rqlQueries.push(storeQuery);
    logTrace(rqlQueries);
    BDA_STORAGE.storeItem('RQLQueries', JSON.stringify(rqlQueries));
  },

    deleteRQLQuery: function(index) {
      try {

        var queries = BDA_STORAGE.getStoredRQLQueries();
        if (queries.length > index) {
          queries.splice(index, 1);
             logTrace(queries);
          BDA_STORAGE.storeItem('RQLQueries', JSON.stringify(queries));
        }
      } catch (e) {
        console.error(e);
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

    if(storedComp.length > 0 && BDA_STORAGE.idsSet(storedComp))
      storedComp = BDA_STORAGE.generateCompIds(storedComp);
    return storedComp;
  },

  idsSet : function(storedComponents)
  {
    for(var i = 0; i != storedComponents.length; i++)
    {
      if (storedComponents[i].hasOwnProperty("id"))
        return false;
    }
    return true;
  },

  generateCompIds : function(storedComponents)
  {
    var curId = 0;
    for(var i = 0; i != storedComponents.length; i++)
    {
      storedComponents[i].id = curId;
      curId++;
    }
    BDA_STORAGE.storeItem('Components', JSON.stringify(storedComponents));
    return storedComponents;
  },

  reloadData : function()
  {
    $.fn.bdaToolbar.reloadToolbar();
    $.fn.bdaRepository.reloadQueryList();
  },

  getTags : function()
  {
      var tags = BDA_STORAGE.getConfigurationValue('tags');
      if(tags === null || tags === undefined)
        tags = {};
      return tags;
  },

  saveTags : function(tags)
  {
    BDA_STORAGE.storeConfiguration('tags', tags);
  },

  getScripts : function()
  {
      var scripts = localStorage.getItem(BDA_STORAGE.scripts);
      if(isNull(scripts) || scripts == "undefined"){
        scripts = {};
      }else{
        scripts = JSON.parse(scripts);
      }
      return scripts;
  },

  saveScripts : function(scripts)
  {
    BDA_STORAGE.storeItem('DashScripts', JSON.stringify(scripts));
  },

};

  var initalized = false;
  // Jquery plugin creation
  $.fn.bdaStorage = function()
   {
     if (!initalized)
     {
       console.log('Init plugin {0}'.format('bdaStorage'));
       //settings = $.extend({}, defaults, options);
       BDA_STORAGE.build();
       initalized = true;
     }
    return this;
  };

  $.fn.bdaStorage.getBdaStorage = function() {
    return BDA_STORAGE;
  };

})(jQuery);
