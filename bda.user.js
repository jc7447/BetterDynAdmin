// ==UserScript==
// @name         Better Dynamo Administration
// @namespace    BetterDynAdmin
// @include      */dyn/admin/*
// @author       Jean-Charles Manoury
// @grant none
// @version 1.0
// @updateUrl    https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
// @downloadUrl  https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
// ==/UserScript==

// a function that loads jQuery and calls a callback function when jQuery has finished loading
function load(url, onLoad, onError) {
    e = document.createElement("script");
    e.setAttribute("src", url);

    if (onLoad != null) { e.addEventListener("load", onLoad); }
    if (onError != null) { e.addEventListener("error", onError); }

    document.body.appendChild(e);

    return e;
}

function execute(functionOrCode) {
    if (typeof functionOrCode === "function") {
        code = "(" + functionOrCode + ")();";
    } else {
        code = functionOrCode;
    }

    e = document.createElement("script");
    e.textContent = code;

    document.body.appendChild(e);

    return e;
}

function loadAndExecute(url, functionOrCode) {
    load(url, function() { execute(functionOrCode); });
}


if (document.getElementById("oracleATGbrand") != null)
{
  loadAndExecute("http://code.jquery.com/jquery-1.11.1.min.js", function (){
  var start = new Date().getTime();
  console.log("Start BDA script");
  function toggleShowLabel(contentDisplay,selector)
  {
    if (contentDisplay == "none")
      $(selector).html("Show more...");
    else
      $(selector).html("Show less...");
  }
  
    function toggleCacheUsage() {
       $(cacheUsageSelector).next().toggle();
       $(cacheUsageSelector).next().next().toggle();
     toggleShowLabel($(cacheUsageSelector).next().css("display"), "#showMoreCacheUsage");
    }
 
    function toggleRepositoryView() {
        $(repositoryViewSelector).next().toggle();
        $(repositoryViewSelector).next().next().toggle();
    toggleShowLabel($(repositoryViewSelector).next().css("display"), "#showMoreRepositoryView");
    }
 
    function toggleProperties() {
        $(propertiesSelector).next().toggle();
    toggleShowLabel($(propertiesSelector).next().css("display"), "#showMoreProperties");
    }
 
    function toggleEventSets() {
        $(eventSetsSelector).next().toggle();
    toggleShowLabel($(eventSetsSelector).next().css("display"), "#showMoreEventsSets");
   }
 
    function toggleMethods() {
        $(methodsSelector).next().toggle();
    toggleShowLabel($(methodsSelector).next().css("display"), "#showMoreMethods");
    }
  
  function toggleRawXml() {
    $("#rawXml").toggle();
    if ($("#rawXml").css("display") == "none")
      $("#rawXmlLink").html("show raw XML");
    else
      $("#rawXmlLink").html("hide raw XML");
  }
    function getDescriptorOptions()
    {
        var descriptorOptions = "";
        $("#descriptorTable tr th:first-child:not([colspan])")
        .sort(function(a, b){
             return $(a).text().toLowerCase() > $(b).text().toLowerCase() ? 1 : -1;
       }).each(function() {

            descriptorOptions += "<option>" + $(this).html().trim() + "</option>\n";
        });
        return descriptorOptions;
    }
 

    function getsubmitButton()
    {
      return "<button type='button' id='RQLAdd'>Add</button>" 
       + "<button type='button' id='RQLGo'>Go</button>";
    }
 
    function getPrintItemEditor()
    {
      $("#itemIdField").show();
      $("#itemDescriptorField").show();
    }
 
    function getAddItemEditor()
    {
        $("#itemIdField").hide();
    $("#itemDescriptorField").show();
    }
 
    function getRemoveItemEditor()
    {
    getPrintItemEditor();
    }
 
    function getUpdateItemEditor()
    {
       getPrintItemEditor();
    }
 
    function getQueryItemsEditor()
    {
      $("#itemIdField").hide();
      $("#itemDescriptorField").show();
    }

    function getPrintItemQuery()
    {
      var id = $("#itemId").val();
      var descriptor = $("#itemDescriptor").val();
      var query = "<print-item id=\"" + id + "\" item-descriptor=\"" + descriptor + "\" />\n";
      return query;
    }
  
    function getRemoveItemQuery()
    {
      var id = $("#itemId").val();
      var descriptor = $("#itemDescriptor").val();
      var query = "<remove-item id=\"" + id + "\" item-descriptor=\"" + descriptor + "\" />\n";
      return query;
    }
 
    function getAddItemQuery()
    {
      var descriptor = $("#itemDescriptor").val();
      var query = "<add-item item-descriptor=\"" + descriptor + "\" >\n";
      query += "  <set-property name=\"\"><![CDATA\[]]></set-property>\n";
      query += "</add-item>\n";
      return query;
    }
  
    function getUpdateItemQuery()
    {
      var descriptor = $("#itemDescriptor").val();
      var id = $("#itemId").val();
      var query = "<update-item id=\"" + id + "\" item-descriptor=\"" + descriptor + "\" >\n";
      query += "  <set-property name=\"\"><![CDATA\[]]></set-property>\n";
      query += "</update-item>\n";
      return query;
    }
 
    function getQueryItemsQuery()
    {
      var descriptor = $("#itemDescriptor").val();
      var query = "<query-items item-descriptor=\"" + descriptor + "\" >\n\n";
      query += "</query-items>\n";
      return query;
    }
 
  function getRQLQuery()
  {
     var query = "";
     var action = $("#RQLAction").val();
     console.log("getRQLQuery : " + action);
     if (action == "print-item")
         query = getPrintItemQuery();
     else if (action == "query-items")
         query = getQueryItemsQuery();
     else if (action == "remove-item")
         query = getRemoveItemQuery();
     else if (action == "add-item")
         query = getAddItemQuery();
     else if (action == "update-item")
         query = getUpdateItemQuery();
     return query;
  }
  
  function submitRQLQuery(addText) 
  {
    if(addText)
    {
      var query = getRQLQuery();
      $("#xmltext").val( $("#xmltext").val()  + query);
    }
    storeSplitValue();
    $("#RQLForm").submit();
  }

  function showTextField(baseId)
  {
    $("#" + baseId).toggle();
    $("#text_" + baseId).toggle();
  }
 
  function endsWith(str, suffix) 
  {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }
  
  function purgeXml(xmlContent)
  {
    var xmlStr = "";
    var lines = xmlContent.split("\n");
    for (var i = 0; i != lines.length; i++)
    {
      var line = lines[i].trim();
      if (!(line.substr(0,1) == "<" && endsWith(line, ">")))
        xmlStr += line + "\n";
    }
    return xmlStr;
  }
  
  /**
   * Avoid xml parse error, when a derived property contains HTML content with a comment.
 * @param {Object} xmlContent
   */
  function dropCommentInsideComment(xmlContent)
  {
    var regexp = /(<\!--.*)<\!--.*-->(.*-->)/gi;
    var res =  xmlContent.replace(regexp, function(str, p1, p2) {
      console.log("p1 : " + p1);
      console.log("p2 : " + p2);
      return p1 + p2;
    })
    return res;
  }
  
  function sanitizeXml(xmlContent)
    {
        var start = new Date().getTime();
      var xmlStr = "";
      xmlStr = dropCommentInsideComment(xmlContent);
      
      var regexp = /<\!--(.*)(\<set\-property.*\>\<\!\[CDATA\[[\S\s]+?\]\]\>\<\/set\-property\>).*-->/ig;
      var res = xmlStr.match(regexp);

      var xmlStr =  xmlStr.replace(regexp, function(str, p1, p2, offset, s){

        //console.log("p1 : " + p1);
        //console.log("p2 : " + p2);
        var derived = false;
        var rdonly = false;
        var exportable = false;
        
        if (p1.indexOf("derived") != -1)
            derived = true;
        if (p1.indexOf("rdonly") != -1)
            rdonly = true;
        if (p1.indexOf("export") != -1)
            exportable = true;
        
        //var lineRegexp = /\<set\-property.*\>\<\!\[CDATA\[[\S\s]+?\]\]\>\<\/set\-property\>/ig
        //var xmltag = "" + p1.match(lineRegexp);
        var xmlDoc = $.parseXML("<xml>" + p2 + "</xml>");
        var $xml = $(xmlDoc);
        var newLine = $xml.find("set-property")
                      .attr("derived", derived).attr("rdonly", rdonly).attr("exportable", exportable)
                      .prop('outerHTML');
       //console.log("newline : " + newLine);
        return newLine;
      });
       var endTime = new Date();
  var time = endTime.getTime() - start;
  if (time > 1000)
    console.log("time to sanitize : " + (time / 1000) + "sec");
  else
    console.log("time to sanitize : " + time + "ms");
      return xmlStr;
    }
    
   
   /*
     function sanitizeXml(xmlContent)
    {
        var start = new Date().getTime();
   var xmlStr = "";
      var lines = xmlContent.split("\n");
      for (var i = 0; i != lines.length; i++)
      {
    var line = lines[i].trim();
        if (line.substr(0,4) == "<!--")
        {
            //console.log("Comment : " + line);
            // pattern : " derived   ", " rdonly   ", " rdonly  derived   ", " export is false   "
            var derived = false;
            var rdonly = false;
            var exportable = false;
            var lineRegexp = new RegExp(/\<set\-property.*\>\<\!\[CDATA\[.*\]\]\>\<\/set\-property\>/ig);
            var rawComment = line.replace(lineRegexp, "");
            //console.log("raw comment : " + rawComment);
            if (rawComment.indexOf("derived") != -1)
                derived = true;
            if (rawComment.indexOf("rdonly") != -1)
                rdonly = true;
            if (rawComment.indexOf("export") != -1)
                exportable = true;
            //console.log("derived : " + derived + ", rdonly : " + rdonly + ", exportable : " + exportable);
            var xmltag = line.match(lineRegexp);
            //console.log("xmltag : " + xmltag);
            xmlDoc = $.parseXML("<xml>" + xmltag + "</xml>");
            $xml = $(xmlDoc);
            var newLine = $xml.find("set-property").attr("derived", derived).attr("rdonly", rdonly).attr("exportable", exportable);
            //console.log(newLine.prop('outerHTML'));
            xmlStr += newLine.prop('outerHTML');
        }
    else if (line.substr(0,1) == "<" && endsWith(line, ">"))
      xmlStr += line;
      }
        var endTime = new Date();
  var time = endTime.getTime() - start;
  if (time > 1000)
    console.log("time to sanitize : " + (time / 1000) + "sec");
  else
    console.log("time to sanitize : " + time + "ms");
      return xmlStr;
    }
    */
   
  function renderTab(types, datas)
  {
    var html = "";
    html += "<table class='dataTable'>";
    for (var i = 0; i != types.length; i++)
    {
      var curProp = types[i];
      if (i % 2 == 0)
        html += "<tr class='even'>";
      else
        html += "<tr class='odd'>";
      html += "<th>" + curProp.name + "<span style='font-size : 80%'>";
      if (curProp.rdonly == "true")
        html += "<div class='prop_attr' style='background-color : red;'>R</div>";
      if (curProp.derived  == "true")
        html += "<div class='prop_attr' style='background-color : green;'>D</div>";
      if (curProp.exportable  == "true")
        html += "<div class='prop_attr' style='background-color : blue;'>E</div>";
      html += "</span></th>";

      for (var a = 0; a < datas.length; a++)
      {
       // var propValue = escapeHTML(datas[a][curProp.name]);
       var propValue = datas[a][curProp.name];
        if (propValue != null)
        {
          if (propValue.length > 25)
          {
            var base_id = curProp.name + "_" + datas[a]["id"];
            var link_id = "link_" + base_id;
            var field_id = "text_" + base_id;
            propValue = "<a class='copyLink' href='javascript:void(0)' title='Show all' id='"+link_id+"' ><span id='"+base_id+"'>" + escapeHTML(propValue.substr(0, 25)) + "...</a>"
                  + "</span><textarea class='copyField' style='display:none;' id='"+field_id+"' readonly>"+ propValue + "</textarea>";
          }
          // 
          html += "<td>" + propValue + "</td>";
        }
        else
        {
          html += "<td>&nbsp;</td>";
          //console.log("propValue not found : " + curProp.name + ", descriptor : " + itemDesc);
        }
      }
      html += "</tr>";
    }
    html += "</table>";
    return html;
  }

  function showRQLResults()
    {
      console.log("Start showRQLResults");

        $("<div id='RQLResults'></div>").insertBefore("#RQLEditor");
        var xmlContent = $(resultsSelector).next().text().trim();
        if (xmlContent.indexOf("--") != -1 )
        {
            var firstLineOffset = xmlContent.indexOf("\n");
            xmlContent = xmlContent.substr(firstLineOffset);
        }
        xmlContent = sanitizeXml(xmlContent);
        //console.log(xmlContent);
        xmlDoc = $.parseXML("<xml>" + xmlContent  + "</xml>");
        $xml = $( xmlDoc );
        $addItems = $xml.find("add-item");
        var types = new Array();
        var datas = new Array();
        var nbTypes = 0;
        $addItems.each(function () {
            var curItemDesc = $(this).attr("item-descriptor");
            types[curItemDesc] = new Array();
            if (datas[curItemDesc] == null)
            {
                datas[curItemDesc] = new Array();
                nbTypes++;
            }
            curData = new Array();
            $(this).find("set-property").each(function (index) {
                curData[$(this).attr("name")] = $(this).text();
                var type = new Object();
                type.name = $(this).attr("name");
                type.rdonly = $(this).attr("rdonly");
                type.derived = $(this).attr("derived");
                type.exportable = $(this).attr("exportable");
                types[curItemDesc].push(type);
            });
          
            types[curItemDesc].sort();
            var typeDescriptor = new Object();
            typeDescriptor.name = "descriptor";
            var typeId = new Object();
            typeId.name = "id";
            types[curItemDesc].unshift(typeDescriptor, typeId);
            curData["descriptor"] = curItemDesc;

            curData["id"] = $(this).attr("id");
            datas[curItemDesc].push(curData);
        });
      
    var html = "<p><a href='javascript:void(0)' id='rawXmlLink'>Show raw xml</a></p>\n";
    html += "<p id='rawXml' style='display:none;'></p>";
        html += "<p>" + $addItems.size() + " items in " + nbTypes + " descriptor(s)</p>";

    var splitValue;
    var splitObj = getStoredSplitObj();
    console.log(splitObj);
    //console.log(">>> activeSplit : " + splitObj.activeSplit);
    if (splitObj == null || splitObj.activeSplit == true)
      splitValue = 0;
    else
      splitValue = parseInt(splitObj.splitValue);
        for(var itemDesc in datas) 
    {
      if (splitValue == 0)
        splitValue = datas[itemDesc].length;
      var nbTab = 0;
      if (datas[itemDesc].length <= splitValue)
        html += renderTab(types[itemDesc], datas[itemDesc]);
      else
      {
        while ((splitValue * nbTab) <=  datas[itemDesc].length)
        {
          var start = splitValue * nbTab;
          var end = start + splitValue;
          if (end > datas[itemDesc].length)
            end = datas[itemDesc].length;
          var subDatas = datas[itemDesc].slice(start, end);
          html += renderTab(types[itemDesc], subDatas);
          nbTab++;
        }
      }
    }
        $("#RQLResults").append(html);
        $("#RQLResults").prepend("<div class='prop_attr' style='background-color : red;'>R</div> : read-only "
                                 + "<div class='prop_attr' style='background-color : green;'>D</div> : derived "
                                 + "<div class='prop_attr' style='background-color : blue;'>E</div> : export is false");
    
    // Move raw xml
    $(resultsSelector).next().appendTo("#rawXml");
    $(resultsSelector).remove();
    $("#rawXmlLink").click(function() {
           toggleRawXml();
        });

    applyCssToTab();
        $(".copyLink").click(function() {
            showTextField($(this).attr("id").replace("link_", ""));
        });
       // console.log(datas);
       // console.log(types);
    }
 
  function applyCssToTab()
  {
        $("#RQLResults").css("margin-top", "10px");
        $(".dataTable").css("font-size", "80%")
                       .css("margin", "5px")
                       .css("border", "1px solid #CCCCCC");

        $(".prop_attr").css("display", "inline-block")
                       .css("margin", "2px")
                       .css("padding", "1px")
                       .css("color", "white")
                       .css("vertical-align", "middle");

        $(".copyLink").css("text-decoration", "none");
        $(".copyField").css("width", "200px");
        $(".dataTable td, .dataTable th").css("padding", "3px");
        $(".dataTable th").css("min-width", "160px").css("text-align", "left");
  }
 
  function showRqlErrors()
  {
    var error = "";
    if ($(errorsSelector1).size() > 0)
    {
      console.log("Case of error  : 1");
      error = $(errorsSelector1).next().text();
      $(resultsSelector).next().remove();
      $(resultsSelector).remove();
      $(errorsSelector1).next().remove();
      $(errorsSelector1).remove();
    }
    else
    {
      console.log("Case of error  : 2");
      error = $(errorsSelector2).text();
    }
    error = purgeXml(error);
    $("<pre id='RQLErrors'></pre>").insertBefore("#RQLEditor");
    $("#RQLErrors").text(error).css("color", "red").css("margin-top", "20px");
  }
  
  function getStoredSplitObj()
  {
    if(!hasWebStorage)
            return null;
    console.log("SplitObj =>" + localStorage.getItem('splitObj'));
    return JSON.parse(localStorage.getItem('splitObj'));
  }
  
  function escapeHTML(s) 
  {
    return String(s).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  
  //--- Stored queries functions ------------------------------------------------------------------------
  function getStoredRQLQueries()
  {
        if(!hasWebStorage)
            return new Array();
    var rqlQueries;
    var rqlQueriesStr = localStorage.getItem('RQLQueries');
    if (rqlQueriesStr != null && rqlQueriesStr != "")
      rqlQueries = JSON.parse(rqlQueriesStr);
    else
      rqlQueries = new Array();
    //console.log("Stored rql queries: " + rqlQueries);
    return rqlQueries;
  }

  function storeSplitValue()
  {
    if(!hasWebStorage)
            return;
    var splitObj = new Object();
    splitObj.splitValue = $("#splitValue").val();
    splitObj.activeSplit = $("#noSplit").is(':checked');
    localStorage.setItem('splitObj', JSON.stringify(splitObj));
  }
  
  function storeRQLQuery(name, query)
  {
    if(hasWebStorage)
    {
      console.log("Try to store : " + name + ", query : " + query);
      var storeQuery = new Object();
      storeQuery.name = name;
      storeQuery.query = query;
      rqlQueries = getStoredRQLQueries();
      rqlQueries.push(storeQuery);
      console.log(rqlQueries);
      localStorage.setItem('RQLQueries', JSON.stringify(rqlQueries));
    }
  }
  
  function showQueryList()
  {
    //console.log("Enter showQueryList");
    if (hasWebStorage)
    {
      var rqlQueries = getStoredRQLQueries();
      var html = "<h3>Stored queries :</h3><ul>";
      if (rqlQueries != null)
      {
        for (var i = 0; i != rqlQueries.length; i++)
        {
          var storeQuery = rqlQueries[i];
          html += "<li>";
          html += "<a href='javascript:void(0)' class='savedQuery'>" + storeQuery.name + "</a>";
          html += "</li>";
        }
      }
      html += "</ul>";
    }
    $("#RQLStoredQueries").html(html);
    $(".savedQuery").click(function() {
      console.log("Click on : " + $(this).html());
      printStoredQuery( $(this).html())
    });
  }

  function printStoredQuery(name)
  {
    var rqlQueries = getStoredRQLQueries();
    if (rqlQueries != null)
    {
      for (var i = 0; i != rqlQueries.length; i++)
      {
        if (rqlQueries[i].name == name)
          $("#xmltext").val(rqlQueries[i].query);
      }
    }
  }
  //--- History functions ------------------------------------------------------------------------
  function collectHistory()
  {
    if (!hasWebStorage)
      return ;
    if (document.URL.indexOf("?") >= 0)
      return ;
    var url = document.URL;
    var componentPath = url.substr(url.indexOf('/dyn'), url.length);
    if (componentPath[componentPath.length - 1] == '/')
      componentPath = componentPath.substr(0, (componentPath.length - 1));
    componentPath = componentPath.replace("//", "/");
    var componentHistory =  JSON.parse(localStorage.getItem('componentHistory')) || [];
    if ($.inArray(componentPath, componentHistory) == -1)
    {
      console.log("Collect : " + componentPath);
      componentHistory.unshift(componentPath);
      if (componentHistory.length >= 10)
        componentHistory = componentHistory.slice(0, 9);
      localStorage.setItem('componentHistory', JSON.stringify(componentHistory));
    }
  }
  
  function showComponentHsitory()
  {
     $("<div id='history'></div>").insertAfter("#oracleATGbrand");
     var componentHistory =  JSON.parse(localStorage.getItem('componentHistory')) || [];
     var html = "Component history : ";
     for (var i = 0; i != componentHistory.length; i++)
     {
      if (i != 0)
        html += ", ";
      var comp = componentHistory[i];
      html += "<a href='" + comp + "'>" + comp.substr(comp.lastIndexOf("/") + 1, comp.length) + "</a>";
     }
     $("#history").css("clear", "both").html(html);
  }
  
  //--- backup panel functions ------------------------------------------------------------------------
  
  function createBackupPanel()
  {
    $("<div id='bdaBackup'></div>").appendTo("body")
    .css("position", "absolute")
    .css("top", "0px")
    .css("right", "30px")
    .css("font-size", "11px")
    .css("color", "white")
    .css("border", "1px solid #8F0000")
    .css("border-top", "none")
    .css("background-color", "#CC0000")
    .css("padding", "3px")
    .html("<p>backup / restore data</p>"
    + "<div class='backupArrow'><img class='up' src='" + arrowImg + "'></div>"
    );
    
    $("#bdaBackup p")
    .css("margin", "0");
    
    $(".backupArrow")
    .css("text-align", "center")
    .css("cursor", "pointer")
    .css("padding-top", "2px");
    
    $(".backupArrow img")
    .css("width", "15px")
    .css("height", "8px");
    
    $("#bdaBackup").click(function() {
      $("#bdaBackupPanel").toggle();
      rotateArrow($(".backupArrow img"));
    });
    
    $("<div id='bdaBackupPanel'></div>").appendTo("body")
    .css("position", "absolute")
    .css("top", "30px")
    .css("right", "30px")
    .css("width", "250px")
    .css("font-size", "11px")
    .css("color", "white")
    .css("border", "1px solid #8F0000")
    .css("border-top", "none")
    .css("background-color", "#CC0000")
    .css("padding", "3px")
    .css("display", "none")
    .html("<p>Why should I save Better Dyn Admin data ? "
    + "<br /><br /> Because BDA use javascript local storage. You will lose your favorite components and your stored queries if you clean your browser."
    + "<br /><br /><strong> Remenber that you can also import your backup to a BDA in another domain !</strong> </p>"
    
    + "<textarea id='bdaData' placeholder='Paste your data here to restore it.'></textarea>"
    + "<button id='bdaDataBackup'>Backup</button>"
    + "<button id='bdaDataRestore'>Restore</button>"
    );

    var dataObj = {};
    dataObj.components = getStoredComponents();
    dataObj.queries = getStoredRQLQueries();
    var dataStr = JSON.stringify(dataObj);
    $("#bdaData")
    .css("width", "100%");

    $("#bdaDataBackup").click(function (){
      copyToClipboard(dataStr);
    });
    
    $("#bdaDataRestore").click(function (){
      if (window.confirm("Sure ?"))
      {
        var data = $("#bdaData").val().trim();
        restoreData(data);
      }
    });
  }
  
  function restoreData(data)
  {
    try 
    {
      var dataObj = JSON.parse(data);
      localStorage.setItem('Components', JSON.stringify(dataObj.components));
      localStorage.setItem('RQLQueries', JSON.stringify(dataObj.queries));
    } 
    catch (e) {
      console.error("Parsing error:", e);
    }
  }
  
  function copyToClipboard(text) 
  {
    window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
  }
  
  //--- Toolbar functions ------------------------------------------------------------------------
  
  function getStoredComponents()
  {
    if(!hasWebStorage)
        return [];
    var storedComp;
    var storedCompStr = localStorage.getItem('Components');
    if (storedCompStr != null)
      storedComp = JSON.parse(storedCompStr);
    else
      storedComp = [];

    return storedComp;
  }
  
  function deleteComponent(componentToDelete)
  {
    console.log("Delete component : " + componentToDelete);
    var components = getStoredComponents();
    for(var i = 0; i != components.length; i++)
    {
      if (components[i].componentName == componentToDelete)
      {
        components.splice(i , 1);
        break;
      }
    }
    console.log(components);
    localStorage.setItem('Components', JSON.stringify(components));
    reloadToolbar();
  }
  
  function storeComponent(component)
  {
    if(hasWebStorage)
    {
      console.log("Try to store : " + component);
      var compObj = new Object();
      compObj.componentPath = component;
      compObj.componentName = getComponentNameFromPath(component);
      compObj.colors = stringToColour(compObj.componentName);
      storedComp = getStoredComponents();
      storedComp.push(compObj);
      console.log(storedComp);
      localStorage.setItem('Components', JSON.stringify(storedComp));
    }
  }
  
  function getComponentNameFromPath(component)
  {
    if (component[component.length - 1] == '/')
      component = component.substr(0, (component.length - 1));
    component = component.replace("//", "/");
    
    var tab = component.split("/");
    return tab[tab.length - 1];
  }
  
  function getComponentShortName(componentName)
  {
    var shortName = "";
    for(var i = 0; i != componentName.length; i++)
    {
      var character = componentName[i];
      if (character == character.toUpperCase())
        shortName += character;
    }
    // TODO : return 3 first letter if shortName is empty
    return shortName;
  }
  
  function getBorderColor(colors)
  {
    var borderColor = [];
    for (var i = 0; i != colors.length; i++)
    {
      var colorValue = colors[i] - 50;
      if (colorValue < 0)
        colorValue = 0;
      borderColor.push(colorValue);
    }
    //console.log("border color : " + borderColor);
    return colorToCss(borderColor);
  }
  
  function colorToCss(colors)
  {
    var cssVal =  "rgb(" ;
    for (var i = 0; i < colors.length; i++)
    {
      if (i != 0)
      cssVal += ",";
      cssVal += colors[i];
    }
    cssVal += ")";
    //console.log("cssVal : " + cssVal);
    return cssVal;
  }
  
  function verifyColor(colors)
  {
    var sum = 0;
    var toCut = 0;

    //console.log("Before verif : " + colors);
    //console.log("sum : " + sum);
    //console.log("toCut : " + toCut);
    for (var i = 0; i < colors.length; i++)
      if (colors[i] > 210)
        colors[i] = 210;
    //console.log("After verif : " + colors)
    return colors;
  }
  
  function stringToColour(str) 
  {
    var colors = [];
    var hash = 0;
    for (var i = 0; i < str.length; i++)
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    //var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      var hexVal = ('00' + value.toString(16)).substr(-2)
      colors.push(parseInt(hexVal, 16));
    }
    return verifyColor(colors);
  }
  
  function showMoreInfos(component)
  {
    console.log("Show more info " + component);
    $("#favMoreInfo" + component).toggle();
  }
  
  function deleteToolbar()
  {
    $("#toolbar").remove();
    $("#toolbarHeader").remove();
  }
  
  function reloadToolbar()
  {
    deleteToolbar();
    createToolbar();
  }
  
  function isComponentAlreadyStored(componentPath)
  {
    var components = getStoredComponents();
    for (var i = 0; i < components.length; i++) {
      if (components[i].componentPath == componentPath)
        return true;
    }
    return false;
  }
  
  function createToolbar()
  {
    var favs = getStoredComponents();
  
    $("<div id='toolbarHeader'></div>")
    //.html("<a href='javascript:void(0)'>Hide toolbar</a>")
    .css("margin-top", "10px")
    .css("font-size", "90%")
    .insertAfter("#oracleATGbrand");

    $("<div id='toolbar'></div>")
    //.css("height", "150px")
    .css("padding", "5px")
    .insertAfter("#toolbarHeader");
    
    $("#toolbarHeader").click(function() {
      $("#toolbar").slideToggle();
    });
    
    for(var i = 0; i != favs.length; i++)
    {
      var fav = favs[i];
      var colors = stringToColour(fav.componentName);
      var shortName = getComponentShortName(fav.componentName);
      $("<div class='fav'></div>")
      .css("background-color", colorToCss(colors))
      .css("border", "1px solid " + getBorderColor(colors))
      .html("<div class='favLink'>"
          + "<a href='" + fav.componentPath + "' title='" + fav.componentName + "' >"
          + "<div class='favTitle'>" +  shortName + "</div>"
          + "<div class='favName'>" + fav.componentName + "</div>"
          +"</a></div>"
          + "<div class='favArrow' id='favArrow" + shortName + "'><img class='up' alt='arrow' src='" + arrowImg + "' /></div>"
          + "<div class='favMoreInfo' id='favMoreInfo" + shortName + "'>"
          + "<div class='favLogDebug'>"
          + " <form method='POST' action='" + fav.componentPath + "' id='logDebugForm" + fav.componentName + "'>"
          + "<input type='hidden' value='loggingDebug' name='propertyName'>"
          + "<input type='hidden' value='' name='newValue'>"
          + "logDebug : "
          + "<a href='javascript:void(0)' class='logdebug' id ='logDebug" + fav.componentName + "'>true</a>"
          + "&nbsp; | &nbsp;"
          + "<a href='javascript:void(0)' class='logdebug' id ='logDebug" + fav.componentName + "'>false</a>"
          +"</div>"
          + "<div class='favDelete' id='delete" + fav.componentName + "'><span style='font-weight:bold; font-size:13px;'>X</span> Delete</div>"
          + "</div>")
          .appendTo("#toolbar");
      // onclick='showMoreInfos(\"" + fav.componentName + "\")'
    }
    
    $(".favArrow").click(function() {
      console.log("Click on arrow");
      var id = this.id;
      var idToExpand = "#" + id.replace("favArrow", "favMoreInfo");
      $(idToExpand).toggle();
      rotateArrow($("#" + id + " img"));
  
    });
    
    $(".favDelete").click(function() {
      console.log("Click on delete");
      var componentToDelete = this.id.replace("delete", "");
      deleteComponent(componentToDelete);
    });
    
      $(".logdebug").click(function() {
      console.log("Click on logdebug");
      var componentName = this.id.replace("logDebug", "");
      var logDebugState = this.innerHTML;
      console.log("component : " + componentName + ", logDebugState : " + logDebugState);
      $("#logDebugForm" + componentName + " input[name=newValue]").val(logDebugState);
      $("#logDebugForm" + componentName).submit();
      //deleteComponent(componentToDelete);
    });

    
    if (isComponentPage())
    {
      var url = document.URL;
      var componentPath = url.substr(url.indexOf('/dyn'), url.length);
      if (!isComponentAlreadyStored(componentPath))
      {
        $("<div class='newFav'><a href='javascript:void(0)' id='addComponent' title='Add component to toolbar'>+</a></div>")
        .css("font-size", "30px")
        .css("border", "1px dashed #CCCCCC")
        .css("height", "54px")
        .css("width", "50px")
        .css("text-align", "center")
        .css("float", "left")
        .css("margin", "4px")
        .css("line-height", "48px")
        .appendTo("#toolbar");

        $("#addComponent")
        .css("color", "#DDDDDD")
        .css("text-decoration", "none")
        .click(function() {
           console.log("Add component");
           storeComponent(componentPath);
           reloadToolbar();
        });
      }
    }

    $(".fav")
    .css("min-height", "50px")
    .css("min-width", "75px")
    .css("margin", "4px")
    .css("padding", "2px")
    .css("color", "white")
    .css("float", "left");
    
    $(".favLink")
    .css("text-align", "center")
    .css("line-height", "21px")  ;
    
    $(".favLink a, .logdebug").css("color", "white").css("text-decoration", "none");
    
    $(".favName")
    .css("display", "inline-block")
    .css("vertical-align", "bottom")
    .css("font-size", "11px");
    
    $(".favArrow")
    .css("text-align", "center")
    .css("cursor", "pointer")
    .css("padding-top", "2px");
    
    $(".favArrow img")
    .css("width", "15px")
    .css("height", "8px");
    
    $(".favTitle")
    .css("font-size", "14px")
    .css("font-weight", "bold")
    .css("margin-bottom", "15px;")
    .css("text-align", "center");
    
    $(".favMoreInfo")
    .css("font-size", "11px")
    .css("display", "none")
    .css("padding", "0")
    .css("text-align", "left");
    
    $(".favDelete")
    .css("cursor", "pointer");
    
    $(".favLogDebug form")
    .css("margin", "0");
    
    $(".favLogDebug")
    .css("margin-bottom", "2px")
    .css("margin-top", "2px");

  }

  //--- Page informations ------------------------------------------------------------------------
  function hasResults(hasErrors)
  {
    return $(resultsSelector).size() > 0;
  }
 
  function hasErrors()
  {
    return $(errorsSelector1).size() > 0 || $(errorsSelector2).size() > 0;
  }
 
  function hasWebStorage()
  {
    if(typeof(Storage) !== "undefined")
      return true;
    return false;
  }
   
  function isRepositoryPage()
  {
    return $("h2:contains('Run XML Operation Tags on the Repository')").size() > 0;
  }

  function isComponentPage()
  {
      return $("h1:contains('Directory Listing')").size() == 0 //Page is not a directory
          && document.URL.indexOf('/dyn/admin/nucleus/') != -1 // Page is in nucleus browser
          && document.URL.indexOf("?") == -1; // Page has no parameter
  }
  
  function rotateArrow($arrow)
  {
     if ($arrow.hasClass("up"))
      $arrow.attr("src", arrowImgRotate).attr("class", "down");
     else
      $arrow.attr("src", arrowImg).attr("class", "up");  
  }
  
  //---- Repository page -------------------------------------------------------------------------
  
  function setupRepositoryPage()
  {
    // Move RQL editor to the top of the page
    var actionSelect = "<select id='RQLAction'>"
                       + "<option>print-item</option>"
                       + "<option>query-items</option>"
                       + "<option>remove-item</option>"
                       + "<option>add-item</option>"
                       + "<option>update-item</option>"
                       + "</select>";
  
     $(descriptorTableSelector).attr("id", "descriptorTable");
  
     $("<div id='RQLEditor'></div>").insertBefore("h2:first");
     if (hasErrors)
      showRqlErrors();
     if (hasResults)
      showRQLResults();

     $("form:eq(1)").appendTo("#RQLEditor");
     $("form:eq(1)").attr("id", "RQLForm");
     var $children = $("#RQLForm").children();
     $("#RQLForm").empty().append($children);
     $("textarea[name=xmltext]").attr("id", "xmltext");
     $("<div id='RQLToolbar'></div>").insertBefore("#RQLEditor textarea");
   
     $("#RQLToolbar").append("<div> Action : "+ actionSelect 
                            + " <span id='editor'>" 
                            + "<span id='itemIdField' style='display:none'>id : <input type='text' id='itemId' style='width:50px'/></span>"
                            + "<span id='itemDescriptorField' style='display:none'> descriptor :  <select id='itemDescriptor'>" + getDescriptorOptions() + "</select></span>"
                            + "</span>" 
                            + getsubmitButton() + "</div>");
     getPrintItemEditor();
     $("#RQLToolbar").after("<div id='RQLText' style='display:inline-block'></div>");
     $("#xmltext").appendTo("#RQLText");
     $("#RQLText").after("<div id='RQLStoredQueries' style='display:inline-block; vertical-align:top'><ul></ul></div>");
    
     $("#RQLStoredQueries").after("<div id='RQLSave'>label : <input type='text' id='queryLabel'>&nbsp;<button type='button' id='saveQuery'>Save this query</button></div>")
     showQueryList();
     $("#RQLSave").css("margin", "5px").after( "<div id='splitToolbar'></div>" );
    
     splitObj = getStoredSplitObj();
     var itemByTab = defaultItemByTab;
     var isChecked = false;
     if (splitObj != null)
      itemByTab = splitObj.splitValue;
     if (splitObj != null)
      isChecked = splitObj.activeSplit
     $("#splitToolbar").append("Split tab every :  <input type='text' value='" + itemByTab + "' id='splitValue' style='width : 40px'> items. ");
     var checkboxSplit =  "<input type='checkbox' id='noSplit' ";
     if (isChecked)
      checkboxSplit += " checked ";
     checkboxSplit += "/> don't split.";
     $("#splitToolbar").append(checkboxSplit);
    
     $("#RQLForm input[type=submit]").attr("type", "button").attr("id", "RQLSubmit");
    
     $("#RQLAction").change(function() {
        var action = $(this).val();
        console.log("Action change : " + action);
        if (action == "print-item")
            getPrintItemEditor();
        else if (action == "query-items")
            getQueryItemsEditor();
        else if (action == "remove-item")
            getRemoveItemEditor();
        else if (action == "add-item")
            getAddItemEditor();
        else if (action == "update-item")
            getUpdateItemEditor();
     });
     
     $("#RQLSubmit").click(function() {
      submitRQLQuery(false);
     });
    
     $("#RQLGo").click(function() {
      submitRQLQuery(true);
     });
    
    $("#RQLAdd").click(function() {
      var query = getRQLQuery();
      $("#xmltext").val( $("#xmltext").val()  + query);
     });
    
     $("#saveQuery").click(function() {
       if ($("#xmltext").val().trim() != "" && $("#queryLabel").val().trim() != "")
       {
         storeRQLQuery($("#queryLabel").val().trim(), $("#xmltext").val().trim());
         showQueryList();
       }
     });
    
    // Hide other sections
    var repositoryView  = "<a href='javascript:void(0)' id='showMoreRepositoryView' style='font-size:80%'>Show less...</a>";
    var cacheUsage  = "&nbsp;<a href='javascript:void(0)' id='showMoreCacheUsage' style='font-size:80%'>Show more...</a>";
 
    var properties  = "&nbsp;<a href='javascript:void(0)' id='showMoreProperties' style='font-size:80%'>Show more...</a>";
    var eventSets  = "&nbsp;<a href='javascript:void(0)' id='showMoreEventsSets' style='font-size:80%'>Show more...</a>";
    var methods  = "&nbsp;<a href='javascript:void(0)' id='showMoreMethods' style='font-size:80%'>Show more...</a>";

    // Auto hide Repository View
     $(repositoryViewSelector).append(repositoryView);
    // toggleRepositoryView();
    $("#showMoreRepositoryView").click(function (){
       toggleRepositoryView();
    });
    // Auto hide Cache usage
    $(cacheUsageSelector).append(cacheUsage);
    toggleCacheUsage();
    $("#showMoreCacheUsage").click(function (){
      toggleCacheUsage();
    });
    // Auto hide Properties
    $(propertiesSelector).append(properties);
    toggleProperties();
    $("#showMoreProperties").click(function (){
      toggleProperties();
    });
    // Auto hide Events Sets
    $(eventSetsSelector).append(eventSets);
    toggleEventSets();
    $("#showMoreEventsSets").click(function (){
      toggleEventSets();
    });
    // Auto hide Methods
    $(methodsSelector).append(methods);
    toggleMethods();
    $("#showMoreMethods").click(function (){
      toggleMethods();
    });
  }

 
  console.log("Jquery installed !");
  console.log("isComponentPage : " + isComponentPage());

  var descriptorTableSelector = "table:eq(0)";
  var repositoryViewSelector = "h2:contains('Examine the Repository, Control Debugging')";
  var cacheUsageSelector = "h2:contains('Cache usage statistics')";
  var propertiesSelector = "h1:contains('Properties')";
  var eventSetsSelector = "h1:contains('Event Sets')";
  var methodsSelector = "h1:contains('Methods')";
  var resultsSelector = "h2:contains('Results:')";
  var errorsSelector1 = "p:contains('Errors:')";
  var errorsSelector2 = "code:contains('*** Query:')";
  
  var defaultItemByTab = "10";
  var hasWebStorage = hasWebStorage();
  var hasErrors = hasErrors();
  var hasResults = hasResults(hasErrors);
 
  console.log("Page has results : " + hasResults + ". Page has errors : " + hasErrors);
  // Setup repository page
  if (isRepositoryPage())
    setupRepositoryPage();
  else
    console.log("This is not a repository page");

  // Global stuff
  var arrowImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gQRFCID3FFd8wAAAK9JREFUOMvV1DsKAkEQhOEaPI4n8ToewHgDEVEwMTLdWFONNzUzMRDEBwZeQH4jsYVV9jHTYCUTfjNMdwWgK6kn6SGfdEIIQ0kSsMIvfeB9DWDjgA4+UIMXCdEMCF8/ANgmQEelLzXo69xFRMeVRs7g+wjopNa8G/zQAp02WjaDHxugs1abbvBTDXQepWYMfq6ALqJ2nMEvP9A8adEC1xJ06dLywM2ga3kGuAOF/i1PqydjYNA1AIEAAAAASUVORK5CYII=";
  var arrowImgRotate = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAGYktHRAAAAAAAAPlDu38AAAAHdElNRQfeBBEUIgPcUV3zAAAAxklEQVRIS9WNOw8BQRSFZ+Mfi1qtEiHRqLRqoqPeVqdRSMQjiv0DMs6cPYjYsI+ZSXzJjTX3nu+Yv8Nam2Iy/Y0DCleYB1c9hwVF87zvjYvWYUDBLO8p5Kwb3noDwin13znplpnGQDShthxHZZitDQRj6qpxUJaOyiA4oqYeeznoKg0CQ8absZOLzp/gcMCYH7Zy0l2IW2L67tozG1V8gmWC6fEsDKmqXuDRTZfrsKxV+Sxt8zkOC9ebqLyDn5v7jkDLGLO8A+Q1Y4g6wU6pAAAAAElFTkSuQmCC"
  $("a").css("text-decoration", "none");
  showComponentHsitory();
  createToolbar();
  createBackupPanel();  

  // Collect history
  if (isComponentPage())
    collectHistory();
   
  // Monitor execution time
  var endTime = new Date();
  var time = endTime.getTime() - start;
  if (time > 1000)
    console.log("BDA takes : " + (time / 1000) + "sec");
  else
    console.log("BDA takes : " + time + "ms");
});
}
else
{
  console.log("BDA script not starting");
}

