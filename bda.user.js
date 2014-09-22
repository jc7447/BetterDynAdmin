// ==UserScript==
// @name         Better Dynamo Administration
// @namespace    BetterDynAdmin
// @include      */dyn/admin/*
// @author       Jean-Charles Manoury
// @grant none
// @version 1.1.1
// @require http://code.jquery.com/jquery-1.11.1.min.js
// @require https://raw.githubusercontent.com/christianbach/tablesorter/master/jquery.tablesorter.min.js
// @require https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/codemirror/codemirror.js
// @require https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/codemirror/xml.js
// @updateUrl    https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
// @downloadUrl  https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
// ==/UserScript==

var BDA = {
  componentBrowserPageSelector : "h1:contains('Component Browser')",
    descriptorTableSelector : "table:eq(0)",
    repositoryViewSelector : "h2:contains('Examine the Repository, Control Debugging')",
    cacheUsageSelector : "h2:contains('Cache usage statistics')",
    propertiesSelector : "h1:contains('Properties')",
    eventSetsSelector : "h1:contains('Event Sets')",
    methodsSelector : "h1:contains('Methods')",
    resultsSelector : "h2:contains('Results:')",
    errorsSelector1 : "p:contains('Errors:')",
    errorsSelector2 : "code:contains('*** Query:')",
    logoSelector : "div#oracleATGbrand",
    oldDynamoSelector : "img[alt='Dynamo Component Browser']",
    arrowImg : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gQRFCID3FFd8wAAAK9JREFUOMvV1DsKAkEQhOEaPI4n8ToewHgDEVEwMTLdWFONNzUzMRDEBwZeQH4jsYVV9jHTYCUTfjNMdwWgK6kn6SGfdEIIQ0kSsMIvfeB9DWDjgA4+UIMXCdEMCF8/ANgmQEelLzXo69xFRMeVRs7g+wjopNa8G/zQAp02WjaDHxugs1abbvBTDXQepWYMfq6ALqJ2nMEvP9A8adEC1xJ06dLywM2ga3kGuAOF/i1PqydjYNA1AIEAAAAASUVORK5CYII=",
    arrowImgRotate : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAGYktHRAAAAAAAAPlDu38AAAAHdElNRQfeBBEUIgPcUV3zAAAAxklEQVRIS9WNOw8BQRSFZ+Mfi1qtEiHRqLRqoqPeVqdRSMQjiv0DMs6cPYjYsI+ZSXzJjTX3nu+Yv8Nam2Iy/Y0DCleYB1c9hwVF87zvjYvWYUDBLO8p5Kwb3noDwin13znplpnGQDShthxHZZitDQRj6qpxUJaOyiA4oqYeeznoKg0CQ8absZOLzp/gcMCYH7Zy0l2IW2L67tozG1V8gmWC6fEsDKmqXuDRTZfrsKxV+Sxt8zkOC9ebqLyDn5v7jkDLGLO8A+Q1Y4g6wU6pAAAAAElFTkSuQmCC",
    trashImg : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA9klEQVQ4jaXTyy4EURgE4G/BLHkOl7WFZGKEjUhcHkwLEvEmLlsJia3BQ1iIMc3CCIs+LWd+PR2ikn9TXVU5p/r8/MQCCtziMU0f+1hs0H9jGocY4XPCjHCETjR3cNZijHMRQ46zjzfYxkvGldjFdcad1Ob57NhXmE18N4WUWE3cDC6T9qPupMhSt8LVuugFbiPTH1C1XRPDZJqEZQwy/T08hYIGSRixhOegHWogX7HeENBLhlxbxiuUWGu5wkoIeWC8xJ1gaCpxUyhxDu/+/htHqmcP9rLU3z6kIj/WFE5DQW1zrtqdMfxrmXLU69zHW5o7E9b5C+ORizSkrnamAAAAAElFTkSuQmCC",
    css : "<style type='text/css'>\
            a{text-decoration : none}\
            #RQLResults{ margin-top : 10px; }\
            .dataTable {font-size : 80%; margin : 5px; border : 1px solid #CCCCCC}\
            .prop_attr {display: inline-block; margin : 2px; padding : 1px; color : white; vertical-align :middle;}\
            .copyLink{text-decoration:none; color:#00214a;}\
            .copyField{width:200px;}\
            .dataTable td, .dataTable th{padding : 3px;}\
            .dataTable th{min-width : 160px; text-align : left; }\
            #itemId {width:125px}\
            table.tablesorter {\
              border: 1px solid #CCCCCC;\
              margin:10px 0pt 15px;\
              font-size: 14px;\
              width: 100%;\
              text-align: left;\
              border-collapse : collapse;\
            }\
            table.tablesorter thead tr th, table.tablesorter tfoot tr th {\
              background-color: #e6EEEE;\
              padding: 4px;\
            }\
            table.tablesorter thead tr .header {\
              background-image: url('data:image/gif;base64,R0lGODlhFQAJAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAkAAAIXjI+AywnaYnhUMoqt3gZXPmVg94yJVQAAOw==');\
              background-repeat: no-repeat;\
              background-position: center right;\
              border: 1px solid #CCCCCC;\
              cursor: pointer;\
            }\
            table.tablesorter tbody td {\
              color: #3D3D3D;\
              padding: 4px;\
              /*background-color: #FFF;*/\
              vertical-align: top;\
              border: 1px solid #CCCCCC;\
            }\
            .tablesorter tbody tr:nth-child(odd) {\
             background-color: #F0F0F6;\
            }\
            table.tablesorter tbody tr.odd td {\
              background-color:#F0F0F6;\
            }\
            table.tablesorter thead tr .headerSortUp {\
              background-image:  url('data:image/gif;base64,R0lGODlhFQAEAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAQAAAINjB+gC+jP2ptn0WskLQA7');\
            }\
            table.tablesorter thead tr .headerSortDown {\
              background-image: url('data:image/gif;base64,R0lGODlhFQAEAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAQAAAINjI8Bya2wnINUMopZAQA7');\
            }\
            table.tablesorter thead tr .headerSortDown, table.tablesorter thead tr .headerSortUp {\
            background-color: #8dbdd8;\
            }\
            .descriptor {\
              margin : 5px 10px 5px 5px; \
            }\
            .descriptorTable {\
              float: left;\
              margin-right : 10px;\
              margin-bottom : 10px;\
              border : 1px solid #ccc;\
              white-space: nowrap;\
            }\
          #RQLText .CodeMirror {\
            border: 1px solid #aaa;\
            height : 250px;\
            width : 600px;\
            cursor : text; \
          }\
         .xmlDefinition .CodeMirror {\
            border: 1px solid #eee;\
            height: auto;\
          }\
          .xmlDefinition .CodeMirror-scroll {\
            overflow-y: hidden;\
            overflow-x: auto;\
          }\
          .btn-desc{\
            display : inline-block;\
            background-color:#f9f9f9;\
            color:#666666;\
            border:1px solid #dcdcdc;\
            padding : 2px;\
            font-size : 12px;\
          }\
          .red {\
           color : #880000;\
          }\
        </style>",
    externalCss : ["https://cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/codemirror.css"],
    defaultItemByTab : "10",
    hasWebStorage : false,
    hasErrors : false,
    hasResults : false,
    isOldDynamo : false,
    isPerfMonitorPage : false,
    isPerfMonitorTimePage : false,
    isXMLDefinitionFilePage : false,
    xmlDefinitionMaxSize : 200000,
    queryEditor : null,
    descriptorList : null,

    init : function(){
        var start = new Date().getTime();
        console.log("Start BDA script");
        this.loadExternalCss();
        this.hasErrors = this.hasErrors();
        this.hasResults = this.hasResults(this.hasErrors);
        this.isOldDynamo = this.isOldDynamo();
        this.isPerfMonitorPage = this.isPerfMonitorPage();
        this.isPerfMonitorTimePage = this.isPerfMonitorTimePage();
        this.isXMLDefinitionFilePage = this.isXMLDefinitionFilePage();
        console.log("isPerfMonitorPage : " + this.isPerfMonitorPage + ", isPerfMonitorTimePage : " + this.isPerfMonitorTimePage);
        if (this.isOldDynamo)
          this.logoSelector = this.oldDynamoSelector;
        console.log("Path : " + $(location).attr('pathname'));
        console.log("isComponentPage : " + this.isComponentPage() + " IsOldDynamo : " + this.isOldDynamo);
        console.log("Page has results : " + this.hasResults + ". Page has errors : " + this.hasErrors);
        // apply css
        $("head").append(this.css);
        $.tablesorter.defaults.sortInitialOrder = 'desc';
        // Setup repository page
        if (this.isRepositoryPage())
          this.setupRepositoryPage();
        else if (this.isXMLDefinitionFilePage)
          this.setupRepositoryDefinitionFilePage();
        else
          console.log("This is not a repository page");

        // Setup performance monitor page
        if (this.isPerfMonitorPage)
          this.setupPerfMonitorPage();
        // Setup performance monitor time page
        if (this.isPerfMonitorTimePage)
          this.setupPerfMonitorTimePage();
        
        this.showComponentHsitory();
        this.createToolbar();
        this.createBackupPanel();
        this.createBugReportPanel();
        this.removeAdminLink();
        
        // Collect history
        if (this.isComponentPage())
          this.collectHistory();
        
        // Monitor execution time
        var endTime = new Date();
        var time = endTime.getTime() - start;
        if (time > 1000)
            console.log("BDA takes : " + (time / 1000) + "sec");
        else
            console.log("BDA takes : " + time + "ms");
    },
    
    removeAdminLink : function()
    {
      $componentBrowserH1 = $(this.componentBrowserPageSelector);
      if ($componentBrowserH1.size() > 0)
      {
        $componentBrowserH1.prev().remove();
        $(this.logoSelector).wrap("<a href='/dyn/admin' />");
      }
    },
    
    loadExternalCss : function(url) 
    {
      for (var i = 0; i != this.externalCss.length; i++)
      {
       $("<link />")
        .attr("type", 'text/css')
        .attr("rel", 'stylesheet')
        .attr("media", 'screen')
        .attr("href", this.externalCss[i])
        .appendTo($("head"));
      }
    },
    
    //--- Page informations ------------------------------------------------------------------------
    isPerfMonitorPage : function()
    {
      return $(location).attr('pathname').indexOf("performance-monitor.jhtml") != -1;
    },
    
    isPerfMonitorTimePage : function()
    {
      return $(location).attr('pathname').indexOf("performance-data-time.jhtml") != -1;
    },
    
    isOldDynamo : function ()
    {
      return $(this.oldDynamoSelector).size() > 0; 
    },
    
    hasResults : function (hasErrors)
    {
        return $(this.resultsSelector).size() > 0;
    },
    
    hasErrors : function ()
    {
        return $(this.errorsSelector1).size() > 0 || $(this.errorsSelector2).size() > 0;
    },
    
    hasWebStorage : function ()
    {
        if(typeof(Storage) !== "undefined")
            return true;
        return false;
    },
    
    isRepositoryPage : function ()
    {
        return $("h2:contains('Run XML Operation Tags on the Repository')").size() > 0;
    },
    
    isXMLDefinitionFilePage : function()
    {
      return $("td:contains('class atg.xml.XMLFile')").size() > 0
          || $("td:contains('class [Latg.xml.XMLFile;')").size() > 0;
    },
    
    isComponentPage : function ()
    {
        return $("h1:contains('Directory Listing')").size() == 0 //Page is not a directory
        && document.URL.indexOf('/dyn/admin/nucleus/') != -1 // Page is in nucleus browser
        && document.URL.indexOf("?") == -1; // Page has no parameter
    },
    
    rotateArrow : function ($arrow)
    {
        if ($arrow.hasClass("up"))
            $arrow.attr("src", this.arrowImgRotate).attr("class", "down");
        else
            $arrow.attr("src", this.arrowImg).attr("class", "up");  
    },
    
    //---- Repository page -------------------------------------------------------------------------
    
        toggleShowLabel : function (contentDisplay,selector)
    {
        if (contentDisplay == "none")
            $(selector).html("Show more...");
        else
            $(selector).html("Show less...");
    },
    
    toggleCacheUsage: function () 
    {
      $cacheUsage = $(this.cacheUsageSelector);
      $cacheUsage.next().toggle().next().toggle();
        this.toggleShowLabel($cacheUsage.next().css("display"), "#showMoreCacheUsage");
    },
    
    toggleRepositoryView : function () 
    {
        $(this.repositoryViewSelector).next().toggle().next().toggle();
        this.toggleShowLabel($(this.repositoryViewSelector).next().css("display"), "#showMoreRepositoryView");
    },
    
    toggleProperties : function () 
    {
        $(this.propertiesSelector).next().toggle();
        this.toggleShowLabel($(this.propertiesSelector).next().css("display"), "#showMoreProperties");
    },
    
    toggleEventSets : function () 
    {
        $(this.eventSetsSelector).next().toggle();
        this.toggleShowLabel($(this.eventSetsSelector).next().css("display"), "#showMoreEventsSets");
    },
    
    toggleMethods : function () 
    {
        $(this.methodsSelector).next().toggle();
        this.toggleShowLabel($(this.methodsSelector).next().css("display"), "#showMoreMethods");
    },
    
    toggleRawXml : function () 
    {
        $("#rawXml").toggle();
        if ($("#rawXml").css("display") == "none")
            $("#rawXmlLink").html("show raw XML");
        else
            $("#rawXmlLink").html("hide raw XML");
    },
    
    getDescriptorList : function()
    {
      if (this.descriptorList != null)
        return this.descriptorList;
      descriptors = [];
        $("#descriptorTable tr th:first-child:not([colspan])")
        .sort(function(a, b){
            return $(a).text().toLowerCase() > $(b).text().toLowerCase() ? 1 : -1;
        }).each(function() {
            
          descriptors.push($(this).html().trim());
        });
        this.descriptorList = descriptors;
        return descriptors;
    },
    
    getDescriptorOptions: function ()
    {
        var descriptorOptions = "";
        var descriptors = this.getDescriptorList();
        for (var i = 0; i != descriptors.length; i++)
          descriptorOptions += "<option>" + descriptors[i] + "</option>\n";
        return descriptorOptions;
    },
    
    getsubmitButton : function ()
    {
        return "<button type='button' id='RQLAdd'>Add</button>" 
        + "<button type='button' id='RQLGo'>Add & Enter</button>";
    },
    
    getPrintItemEditor : function ()
    {
        $("#itemIdField").show();
        $("#itemDescriptorField").show();
    },
    
    getAddItemEditor: function()
    {
        $("#itemIdField").hide();
        $("#itemDescriptorField").show();
    },
    
    getRemoveItemEditor : function ()
    {
        this.getPrintItemEditor();
    },
    
    getUpdateItemEditor : function ()
    {
        this.getPrintItemEditor();
    },
    
    getQueryItemsEditor : function ()
    {
        $("#itemIdField").hide();
        $("#itemDescriptorField").show();
    },
    
    getMultiId : function()
    {
      var ids = $("#itemId").val().trim();
      if (ids.indexOf(",") != -1)
        return ids.split(",");
      return [ids];
    },
    
    getPrintItemQuery : function ()
    {
        var ids = this.getMultiId();
        var descriptor = $("#itemDescriptor").val();
        var query = "";
        for (var i = 0; i != ids.length; i++)
          query += "<print-item id=\"" + ids[i] + "\" item-descriptor=\"" + descriptor + "\" />\n";
        return query;
    },
    
    getRemoveItemQuery : function ()
    {
        var ids = this.getMultiId();
        var descriptor = $("#itemDescriptor").val();
        var query = "";
        for (var i = 0; i != ids.length; i++)
          query += "<remove-item id=\"" + ids[i] + "\" item-descriptor=\"" + descriptor + "\" />\n";
        return query;
    },
    
    getAddItemQuery : function ()
    {
        var descriptor = $("#itemDescriptor").val();
        var query = "<add-item item-descriptor=\"" + descriptor + "\" >\n";
        query += "  <set-property name=\"\"><![CDATA\[]]></set-property>\n";
        query += "</add-item>\n";
        return query;
    },
    
    getUpdateItemQuery : function ()
    {
        var descriptor = $("#itemDescriptor").val();
        var ids = this.getMultiId();
        var query = "";
        for (var i = 0; i != ids.length; i++)
        {
          query += "<update-item id=\"" + ids[i] + "\" item-descriptor=\"" + descriptor + "\" >\n";
          query += "  <set-property name=\"\"><![CDATA\[]]></set-property>\n";
          query += "</update-item>\n";
        }
        return query;
    },
    
    getQueryItemsQuery : function ()
    {
        var descriptor = $("#itemDescriptor").val();
        var query = "<query-items item-descriptor=\"" + descriptor + "\" >\n\n";
        query += "</query-items>\n";
        return query;
    },
    
    getRQLQuery : function ()
    {
        var query = "";
        var action = $("#RQLAction").val();
        console.log("getRQLQuery : " + action);
        if (action == "print-item")
          query = this.getPrintItemQuery();
        else if (action == "query-items")
          query = this.getQueryItemsQuery();
        else if (action == "remove-item")
          query = this.getRemoveItemQuery();
        else if (action == "add-item")
          query = this.getAddItemQuery();
        else if (action == "update-item")
          query = this.getUpdateItemQuery();
        return query;
    },
    
    submitRQLQuery : function (addText)
    {
        if(addText)
        {
            var query = this.getRQLQuery();
            //$("#xmltext").val( $("#xmltext").val()  + query);
            this.setQueryEditorValue(this.getQueryEditorValue() + query);
        }
        this.sanitizeQuery();
        this.storeSplitValue();
        $("#RQLForm").submit();
    },
    
    sanitizeQuery : function()
    {
      var query = this.getQueryEditorValue();
      this.setQueryEditorValue(query.replace(/repository\=\".+\"/gi, "")); 
    },
    
    setQueryEditorValue :function(value) 
    {
      this.queryEditor.getDoc().setValue(value);
    },
    
    getQueryEditorValue : function()
    {
      return this.queryEditor.getDoc().getValue();
    },
    
    showTextField : function (baseId)
    {
        $("#" + baseId).toggle();
        $("#text_" + baseId).toggle();
    },
    
    endsWith : function (str, suffix) 
    {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    
    purgeXml : function (xmlContent)
    {
        var xmlStr = "";
        var lines = xmlContent.split("\n");
        for (var i = 0; i != lines.length; i++)
        {
            var line = lines[i].trim();
            if (!(line.substr(0,1) == "<" && this.endsWith(line, ">")))
                xmlStr += line + "\n";
        }
        return xmlStr;
    },
    
    sanitizeXml : function (xmlContent)
    {
        var start = new Date().getTime();
        
        var regexp = /<\!--(.*)(\<set\-property.*\>\<\!\[CDATA\[[\S\s]+?\]\]\>\<\/set\-property\>).*-->/ig;
        
        var xmlStr =  xmlContent.replace(regexp, function(str, p1, p2, offset, s){
            var attributes = "set-property ";
            
            if (p1.indexOf("derived") != -1)
              attributes += "derived=\"true\" ";
            if (p1.indexOf("rdonly") != -1)
              attributes += "rdonly=\"true\" ";
            if (p1.indexOf("export") != -1)
              attributes += "export=\"true\" ";

            var newLine = p2.replace("set-property", attributes);
            return newLine;
            
        });
        var endTime = new Date();
        var time = endTime.getTime() - start;
        console.log("time to sanitize : " + time + "ms");
        return xmlStr;
    },
    
    renderTab : function (types, datas)
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
                var propValue = datas[a][curProp.name];
                if (propValue != null)
                {
                    if (propValue.length > 25)
                    {
                        var base_id = curProp.name + "_" + datas[a]["id"];
                        var link_id = "link_" + base_id;
                        var field_id = "text_" + base_id;
                        propValue = "<a class='copyLink' href='javascript:void(0)' title='Show all' id='"+link_id+"' ><span id='"+base_id+"'>" + this.escapeHTML(propValue.substr(0, 25)) + "...</a>"
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
    },
    
    showRQLResults : function ()
    {
        console.log("Start showRQLResults");
        
        $("<div id='RQLResults'></div>").insertBefore("#RQLEditor");
        var xmlContent = $(this.resultsSelector).next().text().trim();
        if (xmlContent.indexOf("--") != -1 )
        {
            var firstLineOffset = xmlContent.indexOf("\n");
            xmlContent = xmlContent.substr(firstLineOffset);
        }
        xmlContent = this.sanitizeXml(xmlContent);
        //console.log(xmlContent);
        xmlDoc = $.parseXML("<xml>" + xmlContent  + "</xml>");
        $xml = $( xmlDoc );
        $addItems = $xml.find("add-item");
        var types = [];
        
        var datas = [];
        var nbTypes = 0;
        var typesNames = [];
        $addItems.each(function () {
            var curItemDesc = $(this).attr("item-descriptor");
            if (types[curItemDesc] == null)
                types[curItemDesc] = [];
            if (typesNames[curItemDesc] == null)
                typesNames[curItemDesc] = [];
            if (datas[curItemDesc] == null)
            {
                datas[curItemDesc] = [];
                nbTypes++;
            }
            curData = [];
            $(this).find("set-property").each(function (index) {
                curData[$(this).attr("name")] = $(this).text();
                var type = {};
                type.name = $(this).attr("name");
                if ($.inArray(type.name, typesNames[curItemDesc]) == -1 ) 
                {
                    type.rdonly = $(this).attr("rdonly");
                    type.derived = $(this).attr("derived");
                    type.exportable = $(this).attr("exportable");
                    types[curItemDesc].push(type);
                    typesNames[curItemDesc].push(type.name);
                }
            });
            
            types[curItemDesc].sort();
            if ($.inArray("descriptor", typesNames[curItemDesc]) == -1) 
            {
                var typeDescriptor = {};
                typeDescriptor.name = "descriptor";
                types[curItemDesc].unshift(typeDescriptor);
                typesNames[curItemDesc].push("descriptor");
            }
            if ($.inArray("id", typesNames[curItemDesc]) == -1) 
            {
                var typeId = {};
                typeId.name = "id";
                types[curItemDesc].unshift(typeId);
                typesNames[curItemDesc].push("id");
            }
            curData["descriptor"] = curItemDesc;
            curData["id"] = $(this).attr("id");
            datas[curItemDesc].push(curData);
        });
        
        var startRenderingtab = new Date().getTime();
        var html = "<p><a href='javascript:void(0)' id='rawXmlLink'>Show raw xml</a></p>\n";
        html += "<p id='rawXml' style='display:none;'></p>";
        html += "<p>" + $addItems.size() + " items in " + nbTypes + " descriptor(s)</p>";
        
        var splitValue;
        var splitObj = this.getStoredSplitObj();
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
                html += this.renderTab(types[itemDesc], datas[itemDesc]);
            else
            {
                while ((splitValue * nbTab) <  datas[itemDesc].length)
                {
                    var start = splitValue * nbTab;
                    var end = start + splitValue;
                    if (end > datas[itemDesc].length)
                        end = datas[itemDesc].length;
                    var subDatas = datas[itemDesc].slice(start, end);
                    html += this.renderTab(types[itemDesc], subDatas);
                    nbTab++;
                }
            }
        }
        $("#RQLResults").append(html);
        $("#RQLResults").prepend("<div class='prop_attr' style='background-color : red;'>R</div> : read-only "
                                 + "<div class='prop_attr' style='background-color : green;'>D</div> : derived "
                                 + "<div class='prop_attr' style='background-color : blue;'>E</div> : export is false");

        var endRenderingTab = new Date();
        var time = endRenderingTab.getTime() - startRenderingtab;
        console.log("time to render tab : " + time + "ms");
        // Move raw xml
        $(this.resultsSelector).next().appendTo("#rawXml");
        $(this.resultsSelector).remove();
        $("#rawXmlLink").click(function() {
            BDA.toggleRawXml();
        });
        
        
        $(".copyLink").click(function() {
            BDA.showTextField($(this).attr("id").replace("link_", ""));
        });
    },

    showRqlErrors : function ()
    {
        var error = "";
        if ($(this.errorsSelector1).size() > 0)
        {
            console.log("Case of error  : 1");
            error = $(this.errorsSelector1).next().text();
            $(this.resultsSelector).next().remove();
            $(this.resultsSelector).remove();
            $(this.errorsSelector1).next().remove();
            $(this.errorsSelector1).remove();
        }
        else
        {
            console.log("Case of error  : 2");
            error = $(this.errorsSelector2).text();
        }
        error = this.purgeXml(error);
        $("<pre id='RQLErrors'></pre>").insertBefore("#RQLEditor");
        $("#RQLErrors").text(error).css("color", "red").css("margin-top", "20px");
    },
    
    getStoredSplitObj : function ()
    {
        if(!this.hasWebStorage)
            return null;
        return JSON.parse(localStorage.getItem('splitObj'));
    },
    
    escapeHTML : function (s) 
    {
        return String(s).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    
    setupRepositoryDefinitionFilePage : function()
    {
      var xmlSize = 0;
      $("pre").each(function(index) {
        xmlSize += $(this).html().length;
      });
      console.log("Xml size : " + xmlSize);
      if (xmlSize < this.xmlDefinitionMaxSize)
      {
        this.hightlightAndIndentXml($("pre"));
      }
      else
      {
        $("<p />")
        .html("The definition file is big, to avoid slowing down the page, XML highlight and indentation have been disabled. <br> <button id='xmlHiglightBtn'>Highlight and indent now</button> <small>(takes few seconds)</small>")
        .insertAfter($("h3:contains('Value')"));
        
        $("#xmlHiglightBtn").click(function() {
          BDA.hightlightAndIndentXml($("pre"));
        });
      }
    },

    hightlightAndIndentXml : function($elm)
    {
      $elm.each(function(index) {
        var $code = $(this).html();
        var $unescaped = $('<div/>').html($code).text();
        $(this).empty();
        $("<div />").attr("id", "xmlDefinition" + index).addClass("xmlDefinition").insertBefore($(this));

        var xmlDefEditor = CodeMirror(document.getElementById("xmlDefinition" + index), {
            value: $unescaped,
            mode: 'xml',
            lineNumbers: false,
            lineWrapping : false,
            readOnly: true,
        });
        xmlDefEditor.operation(function() {
          for (var i = 0; i < xmlDefEditor.lineCount(); ++i)
            xmlDefEditor.indentLine(i, "smart");
        });
      });
    },
    
    setupRepositoryPage : function ()
    {
        // Move RQL editor to the top of the page
        var actionSelect = "<select id='RQLAction'>"
        + "<option>print-item</option>"
        + "<option>query-items</option>"
        + "<option>remove-item</option>"
        + "<option>add-item</option>"
        + "<option>update-item</option>"
        + "</select>";
        
        $(this.descriptorTableSelector).attr("id", "descriptorTable");
        
        $("<div id='RQLEditor'></div>").insertBefore("h2:first");
        
        if (this.hasErrors)
            this.showRqlErrors();
        if (this.hasResults)
            this.showRQLResults();
        
        $("form:eq(1)").appendTo("#RQLEditor");
        $("form:eq(1)").attr("id", "RQLForm");
        var $children = $("#RQLForm").children();
        $("#RQLForm").empty().append($children);
        $("textarea[name=xmltext]").attr("id", "xmltext");
        $("<div id='RQLToolbar'></div>").insertBefore("#RQLEditor textarea");
        
        
        $("#RQLToolbar").append("<div> Action : "+ actionSelect 
                                + " <span id='editor'>" 
                                + "<span id='itemIdField' >ids : <input type='text' id='itemId' placeholder='Id1,Id2,Id3' /></span>"
                                + "<span id='itemDescriptorField' > descriptor :  <select id='itemDescriptor'>" + this.getDescriptorOptions() + "</select></span>"
                                + "</span>" 
                                + this.getsubmitButton() + "</div>");

        $("#RQLToolbar").after("<div id='RQLText' style='display:inline-block'></div>");
        $("#xmltext").appendTo("#RQLText");
        $("#RQLText").after("<div id='RQLDescProperty' style='display:inline-block; vertical-align:top'></div>");
        
        $("#RQLDescProperty").after("<div id='RQLStoredQueries'></div>");

        $("#RQLStoredQueries").after("<div id='RQLSave'>label : <input type='text' id='queryLabel'>&nbsp;<button type='button' id='saveQuery'>Save this query</button></div>");
        this.showQueryList();
        $("#RQLSave").css("margin", "5px").after( "<div id='splitToolbar'></div>" );
        
        splitObj = this.getStoredSplitObj();
        var itemByTab = this.defaultItemByTab;
        var isChecked = false;
        if (splitObj != null)
            itemByTab = splitObj.splitValue;
        if (splitObj != null)
            isChecked = splitObj.activeSplit;
            $("#splitToolbar").append("Split tab every :  <input type='text' value='" + itemByTab + "' id='splitValue' style='width : 40px'> items. ");
        var checkboxSplit =  "<input type='checkbox' id='noSplit' ";
        if (isChecked)
            checkboxSplit += " checked ";
        checkboxSplit += "/> don't split.";
        $("#splitToolbar").append(checkboxSplit);
        
        $("#RQLForm input[type=submit]").attr("type", "button").attr("id", "RQLSubmit");
        this.queryEditor = CodeMirror.fromTextArea(document.getElementById("xmltext"), {lineNumbers: false});
        
        this.setupItemDescriptorTable();
        
        $("#RQLAction").change(function() {
            var action = $(this).val();
            console.log("Action change : " + action);
            if (action == "print-item")
              BDA.getPrintItemEditor();
            else if (action == "query-items")
              BDA.getQueryItemsEditor();
            else if (action == "remove-item")
              BDA.getRemoveItemEditor();
            else if (action == "add-item")
              BDA.getAddItemEditor();
            else if (action == "update-item")
              BDA.getUpdateItemEditor();
         });
        
        $("#RQLSubmit").click(function() {
            BDA.submitRQLQuery(false);
        });
        
        $("#RQLGo").click(function() {
            BDA.submitRQLQuery(true);
        });
        
        $("#RQLAdd").click(function() {
            var query = BDA.getRQLQuery();
            BDA.setQueryEditorValue(BDA.getQueryEditorValue() + query);
           // BDA.showItemPropertyList($("#itemDescriptor").val());
        });
        
        $("#saveQuery").click(function() {
            if (BDA.getQueryEditorValue().trim() != "" && $("#queryLabel").val().trim() != "")
            {
              BDA.storeRQLQuery($("#queryLabel").val().trim(), BDA.getQueryEditorValue().trim());
              BDA.showQueryList();
            }
        });
        
        // Hide other sections
        var repositoryView  = "<a href='javascript:void(0)' id='showMoreRepositoryView' style='font-size:80%'>Show less...</a>";
        var cacheUsage  = "&nbsp;<a href='javascript:void(0)' id='showMoreCacheUsage' style='font-size:80%'>Show more...</a>";
        
        var properties  = "&nbsp;<a href='javascript:void(0)' id='showMoreProperties' style='font-size:80%'>Show more...</a>";
        var eventSets  = "&nbsp;<a href='javascript:void(0)' id='showMoreEventsSets' style='font-size:80%'>Show more...</a>";
        var methods  = "&nbsp;<a href='javascript:void(0)' id='showMoreMethods' style='font-size:80%'>Show more...</a>";
        
        // Auto hide Repository View
        $(this.repositoryViewSelector).append(repositoryView);
        // toggleRepositoryView();
        $("#showMoreRepositoryView").click(function (){
            BDA.toggleRepositoryView();
        });
        // Auto hide Cache usage
        $(this.cacheUsageSelector).append(cacheUsage);
        this.toggleCacheUsage();
        $("#showMoreCacheUsage").click(function (){
            BDA.toggleCacheUsage();
        });
        // Auto hide Properties
        $(this.propertiesSelector).append(properties);
        this.toggleProperties();
        $("#showMoreProperties").click(function (){
            BDA.toggleProperties();
        });
        // Auto hide Events Sets
        $(this.eventSetsSelector).append(eventSets);
        this.toggleEventSets();
        $("#showMoreEventsSets").click(function (){
            BDA.toggleEventSets();
        });
        // Auto hide Methods
        $(this.methodsSelector).append(methods);
        this.toggleMethods();
        $("#showMoreMethods").click(function (){
            BDA.toggleMethods();
        });
    },
    
    showItemPropertyList : function(item)
    {
      console.log("showItemPropertyList");
      //https://com01-eram.betapgc.com/dyn/admin/nucleus/atg/commerce/catalog/ProductCatalog/?action=seetmpl&itemdesc=categoryAlias#showProperties
      var componentPath = window.location.pathname;
      var url = componentPath + "?action=seetmpl&itemdesc=" + item + "#showProperties";
      console.log(url);
      $.get(url, function(data) {
       // console.log(data);
         $pTable = $(data).find("a[name='showProperties']").next();
         $pTable.find('th:nth-child(2), td:nth-child(2),th:nth-child(4), td:nth-child(4),th:nth-child(5), td:nth-child(5),th:nth-child(6), td:nth-child(6)').remove();
         $pTable.css("font-size", "80%");
         $("#RQLDescProperty").empty().append($pTable);
      });
    },
    
    setupItemDescriptorTable : function ()
    {
      var descriptors = this.getDescriptorList();
      // ?action=seetmpl&itemdesc=foreignCatalog#showProperties
      // ?action=seeitems&itemdesc=foreignCatalog#seeItems
      // ?action=seenamed&itemdesc=foreignCatalog#namedQuery
      // ?action=setiddbg&itemdesc=foreignCatalog#listItemDescriptors
      // ?action=dbgprops&itemdesc=foreignCatalog#debugProperties
      var componentPath = window.location.pathname;
      var splitValue = 20;
      var html = "<p>" + descriptors.length + " descriptors available.</p>";
      html += "<div>";
      for (var i = 0; i != descriptors.length; i++)
      {
        if (i == 0 || i % splitValue == 0)
        {
        html += "<table class='descriptorTable'>";
          html += "<th>Descriptor</th>";
          html += "<th>View</th>";
           html += "<th>Debug</th>";
        }
          if (i % 2 == 0)
              html += "<tr class='even'>";
          else
              html += "<tr class='odd'>";
          var isDebugEnable = false;
          if ($("a[href='" + componentPath + "?action=clriddbg&itemdesc=" + descriptors[i] + "#listItemDescriptors']").size() > 0)
            isDebugEnable = true;
        html += "<td class='descriptor'>" + descriptors[i] + "</td>";
        html += "<td><a class='btn-desc' href='" + componentPath + "?action=seetmpl&itemdesc=" + descriptors[i] + "#showProperties'>Properties</a>";
        html += "&nbsp;<a class='btn-desc' class='btn-desc' href='" + componentPath + "?action=seenamed&itemdesc=" + descriptors[i] + "#namedQuery'>Named queries</a></td>";
        
        html += "<td>";
        if (isDebugEnable)
          html += "<a class='btn-desc red' href='" + componentPath + "?action=clriddbg&itemdesc=" + descriptors[i] + "#listItemDescriptors'>Disable</a>";
        else
        {
        html += "<a class='btn-desc' href='" + componentPath + "?action=setiddbg&itemdesc=" + descriptors[i] + "#listItemDescriptors'>Enable</a>";
          html += "&nbsp;<a class='btn-desc' href='" + componentPath + "?action=dbgprops&itemdesc=" + descriptors[i] + "#debugProperties'>Edit</a>";
        }
        html += "</td>";
        html += "</tr>";
        if (i != 0 && ((i + 1) % splitValue == 0 || i + 1 == descriptors.length))
          html += "</table>";
      }
      html += "</div>";
      html += "<div style='clear:both' />";
      
      $("#descriptorTable").remove();
      $(html).insertAfter("a[name='listItemDescriptors']");
      
      
    },
    
    showQueryList : function ()
    {
      var html = "";
        if (this.hasWebStorage)
        {
            var rqlQueries = this.getStoredRQLQueries();
            if (rqlQueries != null)
            {
                if (rqlQueries.length > 0)
                    html += "<span style='font-size : 13px; font-weight : bold'>Stored queries :</span>";
                for (var i = 0; i != rqlQueries.length; i++)
                {
                    var storeQuery = rqlQueries[i];
                    html += "<span class='savedQuery'>";
                    html += "<a href='javascript:void(0)'>" + storeQuery.name + "</a><span id='deleteQuery" + i + "'class='deleteQuery' style='cursor : pointer'><img src='" + this.trashImg + "' height='12' width='12' /></span>";
                    html += "</span>";
                }
                //html += "</ul>";
            }
        }
        $("#RQLStoredQueries").html(html);
        $(".savedQuery").click(function() {
            printStoredQuery( $(this).find("a").html());
        });
        
        $(".savedQuery").hover( function() {
            $(this).find("span.deleteQuery").toggle();
        }, function() {
            $(this).find("span.deleteQuery").toggle();
        });
        
        $(".deleteQuery")
        .css("display", "none")
        .css("margin-top", "5px")
        .css("margin-left", "10px")
        .click(function() {
            var index = this.id.replace("deleteQuery", "");
            console.log("Delete query #" + index);
            deleteRQLQuery(index);
            reloadQueryList();
        });
    },
      //--- Stored queries functions ------------------------------------------------------------------------
    
  getStoredRQLQueries : function ()
  {
    if(!this.hasWebStorage)
      return [];
    var rqlQueries;
    var rqlQueriesStr = localStorage.getItem('RQLQueries');
    if (rqlQueriesStr != null && rqlQueriesStr != "")
      rqlQueries = JSON.parse(rqlQueriesStr);
    else
      rqlQueries = [];
    return rqlQueries;
  },

  storeSplitValue : function ()
  {
    if(!this.hasWebStorage)
            return;
    var splitObj = {};
    splitObj.splitValue = $("#splitValue").val();
    splitObj.activeSplit = $("#noSplit").is(':checked');
    localStorage.setItem('splitObj', JSON.stringify(splitObj));
  },
  
   storeRQLQuery : function (name, query)
  {
    if(this.hasWebStorage)
    {
      console.log("Try to store : " + name + ", query : " + query);
      var storeQuery = {};
      storeQuery.name = name;
      storeQuery.query = query;
      rqlQueries = this.getStoredRQLQueries();
      rqlQueries.push(storeQuery);
      console.log(rqlQueries);
      localStorage.setItem('RQLQueries', JSON.stringify(rqlQueries));
    }
  },
  
  deleteRQLQuery : function (index)
  {
    var queries = this.getStoredRQLQueries();
    if (queries.length >  index)
    {
      queries.splice(index, 1);
      localStorage.setItem('RQLQueries', JSON.stringify(queries));
    } 
  },
  
   reloadQueryList : function ()
  {
    $("#RQLStoredQueries").empty();
    this.showQueryList();
  },
  
  /*
  showQueryList : function ()
  {
    var html = "";
    if (this.hasWebStorage)
    {
      var rqlQueries = this.getStoredRQLQueries();
      
      if (rqlQueries != null)
      {
        if (rqlQueries.length > 0)
          html += "<span style='font-size : 13px; font-weight : bold'>Stored queries :</span><ul style='margin :  0; padding-left :15px'>";
        for (var i = 0; i != rqlQueries.length; i++)
        {
          var storeQuery = rqlQueries[i];
          html += "<li class='savedQuery'>";
          html += "<a href='javascript:void(0)'>" + storeQuery.name + "</a><span id='deleteQuery" + i + "'class='deleteQuery' style='cursor : pointer'><img src='" + this.trashImg + "' height='12' width='12' /></span>";
          html += "</li>";
        }
        html += "</ul>";
      }
    }
    $("#RQLStoredQueries").html(html);
    $(".savedQuery").click(function() {
      BDA.printStoredQuery( $(this).find("a").html());
    });
    
    $(".savedQuery").hover( function() {
        $(this).find("span.deleteQuery").toggle();
      }, function() {
        $(this).find("span.deleteQuery").toggle();
    });
      
    $(".deleteQuery")
    .css("display", "none")
    .css("margin-top", "5px")
    .css("margin-left", "10px")
    .click(function() {
      var index = this.id.replace("deleteQuery", "");
      console.log("Delete query #" + index);
      BDA.deleteRQLQuery(index);
      BDA.reloadQueryList();
    });
  },
*/
   printStoredQuery : function (name)
  {
    var rqlQueries = this.getStoredRQLQueries();
    if (rqlQueries != null)
    {
      for (var i = 0; i != rqlQueries.length; i++)
      {
        if (rqlQueries[i].name == name)
          this.setQueryEditorValue(rqlQueries[i].query + "\n");
      }
    }
  },
      //--- History functions ------------------------------------------------------------------------
    collectHistory : function ()
  {
    if (!this.hasWebStorage)
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
  },
  
   showComponentHsitory : function ()
  {
     $("<div id='history'></div>").insertAfter(this.logoSelector);
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
  },

  //--- Bug report panel
  
  createBugReportPanel : function() 
  {
    var labels = ["Found a bug in BDA ?", "Want a new feature ?", "What's new in BDA ?"];
    var labelIndex = Math.floor((Math.random() * labels.length)); 
    
      $("<div id='bdaBug'></div>").appendTo("body")
      .css("position", "absolute")
      .css("top", "0px")
      .css("right", "30px")
      .css("font-size", "11px")
      .css("color", "white")
      .css("border", "1px solid #00486c")
      .css("border-top", "none")
      .css("background-color", "#007bb8")
      .css("padding", "3px")
      .html("<p>" + labels[labelIndex] + "</p>"
      + "<div class='bugArrow'><img class='up' src='" + this.arrowImg + "'></div>"
      );
    
      $("#bdaBug p")
      .css("margin", "0");
      
      $(".bugArrow")
      .css("text-align", "center")
      .css("cursor", "pointer")
      .css("padding-top", "2px");
      
      $(".bugArrow img")
      .css("width", "15px")
      .css("height", "8px");
      
      $("<div id='bdaBugPanel'></div>").appendTo("body")
      .css("position", "absolute")
      .css("top", "30px")
      .css("right", "30px")
      .css("width", "250px")
      .css("font-size", "11px")
      .css("color", "white")
      .css("border", "1px solid #00486c")
      .css("border-top", "none")
      .css("background-color", "#007bb8")
      .css("padding", "3px")
      .css("display", "none")
     
      .html("<p>How can I help and stay tuned ? "
      + "<br /><br /> Better Dyn Admin have a <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin'>GitHub page</a>. <br>"
      + "Please report any bug in the <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin/issues'>issues tracker</a>. Of course, you can also request new feature or suggest enhancement !"
      + "<br /><br /> Stay tuned, look at the <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin/milestones'>incoming milestones</a>."
      + "<br /><br /> <strong> BDA version " + GM_info.script.version + "</strong> </p>"
      );
      
      $("#bdaBugPanel a").css("text-decoration", "underline").css("color", "white");
      
      $("#bdaBug").click(function() {
        $("#bdaBugPanel").toggle();
        BDA.rotateArrow($(".bugArrow img"));
        if ($("#bdaBackupPanel").css("display") != "none")
        {
          $("#bdaBackupPanel").toggle();
          BDA.rotateArrow($(".backupArrow img"));
        }
      });
      
      
  },
    
   //--- backup panel functions ------------------------------------------------------------------------
  
  createBackupPanel : function ()
  {
    $("<div id='bdaBackup'></div>").appendTo("body")
    .css("position", "absolute")
    .css("top", "0px")
    .css("right", "153px")
    .css("font-size", "11px")
    .css("color", "white")
    .css("border", "1px solid #8F0000")
    .css("border-top", "none")
    .css("background-color", "#CC0000")
    .css("padding", "3px")
    .html("<p>Backup / restore data</p>"
    + "<div class='backupArrow'><img class='up' src='" + this.arrowImg + "'></div>"
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
      BDA.rotateArrow($(".backupArrow img"));
      if ($("#bdaBugPanel").css("display") != "none")
      {
        $("#bdaBugPanel").toggle();
        BDA.rotateArrow($(".bugArrow img"));
      }
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

    //var dataStr = JSON.stringify(dataObj);
    $("#bdaData")
    .css("width", "100%");

    $("#bdaDataBackup").click(function (){
      var dataObj = {};
      dataObj.components = BDA.getStoredComponents();
      dataObj.queries = BDA.getStoredRQLQueries();
      BDA.copyToClipboard(JSON.stringify(dataObj));
    });
    
    $("#bdaDataRestore").click(function (){
      if (window.confirm("Sure ?"))
      {
        var data = $("#bdaData").val().trim();
        BDA.restoreData(data);
      }
    });
  },
  
  restoreData : function (data)
  {
    try 
    {
      var dataObj = JSON.parse(data);
      localStorage.setItem('Components', JSON.stringify(dataObj.components));
      localStorage.setItem('RQLQueries', JSON.stringify(dataObj.queries));
      this.reloadToolbar();
      if (this.isRepositoryPage())
        this.reloadQueryList();
    } 
    catch (e) {
      console.error("Parsing error:", e);
    }
  },
  
  copyToClipboard : function (text) 
  {
    window.prompt("Copy the data below : Ctrl+C + Enter and save it into a file !", text);
  },
  
  //--- Toolbar functions ------------------------------------------------------------------------
  
  getStoredComponents : function ()
  {
    if(!this.hasWebStorage)
        return [];
    var storedComp;
    var storedCompStr = localStorage.getItem('Components');
    if (storedCompStr != null)
      storedComp = JSON.parse(storedCompStr);
    else
      storedComp = [];

    return storedComp;
  },
  
  deleteComponent : function (componentToDelete)
  {
    console.log("Delete component : " + componentToDelete);
    var components = this.getStoredComponents();
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
    this.reloadToolbar();
  },
  
  storeComponent : function (component)
  {
    if(this.hasWebStorage)
    {
      console.log("Try to store : " + component);
      var compObj = {};
      compObj.componentPath = component;
      compObj.componentName = this.getComponentNameFromPath(component);
      compObj.colors = this.stringToColour(compObj.componentName);
      storedComp = this.getStoredComponents();
      storedComp.push(compObj);
      console.log(storedComp);
      localStorage.setItem('Components', JSON.stringify(storedComp));
    }
  },
  
  getComponentNameFromPath : function (component)
  {
    if (component[component.length - 1] == '/')
      component = component.substr(0, (component.length - 1));
    component = component.replace("//", "/");
    
    var tab = component.split("/");
    return tab[tab.length - 1];
  },
  
  getComponentShortName : function (componentName)
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
  },
  
  getBorderColor : function (colors)
  {
    var borderColor = [];
    for (var i = 0; i != colors.length; i++)
    {
      var colorValue = colors[i] - 50;
      if (colorValue < 0)
        colorValue = 0;
      borderColor.push(colorValue);
    }
    return this.colorToCss(borderColor);
  },
  
  colorToCss : function (colors)
  {
    var cssVal =  "rgb(" ;
    for (var i = 0; i < colors.length; i++)
    {
      if (i != 0)
      cssVal += ",";
      cssVal += colors[i];
    }
    cssVal += ")";
    return cssVal;
  },
  
  verifyColor : function (colors)
  {
    for (var i = 0; i < colors.length; i++)
      if (colors[i] > 210)
        colors[i] = 210;
    return colors;
  },
  
   stringToColour : function (str) 
  {
    var colors = [];
    var hash = 0;
    for (var i = 0; i < str.length; i++)
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      var hexVal = ('00' + value.toString(16)).substr(-2);
      colors.push(parseInt(hexVal, 16));
    }
    return this.verifyColor(colors);
  },
  
  showMoreInfos : function (component)
  {
    console.log("Show more info " + component);
    $("#favMoreInfo" + component).toggle();
  },
  
  deleteToolbar : function ()
  {
    $("#toolbar").remove();
    $("#toolbarHeader").remove();
  },
  
   reloadToolbar: function ()
  {
    this.deleteToolbar();
    this.createToolbar();
  },
  
   isComponentAlreadyStored : function(componentPath)
  {
    var components = this.getStoredComponents();
    for (var i = 0; i < components.length; i++) {
      if (components[i].componentPath == componentPath)
        return true;
    }
    return false;
  },
  
  createToolbar :function ()
  {
    var favs = this.getStoredComponents();

    $("<div id='toolbarContainer'></div>")
    .insertAfter(this.logoSelector);

    $("<div id='toolbar'></div>")
    .css("padding", "5px")
    .appendTo("#toolbarContainer");

    for(var i = 0; i != favs.length; i++)
    {
      var fav = favs[i];
      var colors = this.stringToColour(fav.componentName);
      var shortName = this.getComponentShortName(fav.componentName);
      $("<div class='fav'></div>")
      .css("background-color", this.colorToCss(colors))
      .css("border", "1px solid " + this.getBorderColor(colors))
      .html("<div class='favLink'>"
          + "<a href='" + fav.componentPath + "' title='" + fav.componentName + "' >"
          + "<div class='favTitle'>" +  shortName + "</div>"
          + "<div class='favName'>" + fav.componentName + "</div>"
          +"</a></div>"
          + "<div class='favArrow' id='favArrow" + shortName + "'><img class='up' alt='arrow' src='" + this.arrowImg + "' /></div>"
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
    }
    
    $(".favArrow").click(function() {
      console.log("Click on arrow");
      var id = this.id;
      var idToExpand = "#" + id.replace("favArrow", "favMoreInfo");
      $(idToExpand).toggle();
      BDA.rotateArrow($("#" + id + " img"));
  
    });
    
    $(".favDelete").click(function() {
      console.log("Click on delete");
      var componentToDelete = this.id.replace("delete", "");
      BDA.deleteComponent(componentToDelete);
    });
    
      $(".logdebug").click(function() {
      console.log("Click on logdebug");
      var componentName = this.id.replace("logDebug", "");
      var logDebugState = this.innerHTML;
      console.log("component : " + componentName + ", logDebugState : " + logDebugState);
      $("#logDebugForm" + componentName + " input[name=newValue]").val(logDebugState);
      $("#logDebugForm" + componentName).submit();
    });

    
    if (this.isComponentPage())
    {
    var url = document.URL;
    var componentPath = url.substr(url.indexOf('/dyn'), url.length);
    if (!this.isComponentAlreadyStored(componentPath))
    {
      $("<div class='newFav'><a href='javascript:void(0)' id='addComponent' title='Add component to toolbar'>+</a></div>")
      .css("font-size", "30px")
      .css("border", "1px dashed #AAAAAA")
      .css("height", "54px")
      .css("width", "50px")
      .css("text-align", "center")
      .css("float", "left")
      .css("margin", "4px")
      .css("line-height", "48px")
      .appendTo("#toolbar");

      $("#addComponent")
      .css("color", "#AAAAAA")
      .css("text-decoration", "none");
      $(".newFav")
      .css("cursor", "pointer")
      .click(function() {
         console.log("Add component");
         BDA.storeComponent(componentPath);
         BDA.reloadToolbar();
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

  },
  
  setupPerfMonitorPage : function()
  {
    this.setupSortingTabPerfMonitor($("table:eq(1)"));
  },
  
  setupPerfMonitorTimePage : function()
  {
    this.setupSortingTabPerfMonitor($("table:eq(0)"));
  },
  
  setupSortingTabPerfMonitor : function($tabSelector)
  {
    $tabSelector.addClass("tablesorter")
    .removeAttr("border")
    .removeAttr("cellpadding");
    $tabSelector.prepend("<thead class='thead' />");
    // Put first tr into a thead tag
    $tabSelector.find("tr:eq(0)").appendTo(".thead");
    // Replace td by th
    $('.thead td').each(function() {
      var $this = $(this);
      $this.replaceWith('<th class="' + this.className + '">' + $this.text() + '</th>');
  });
    $tabSelector.tablesorter(); 
  }
};

function isOldDynAdmin()
{
    var alts = ["Dynamo Component Browser", "Dynamo Administration", "Performance Monitor", "Dynamo Batch Compiler"];
   for(var els = document.getElementsByTagName ('img'), i = els.length; i--;)
    {
       if (alts.indexOf(els[i].alt) != -1)
         return true;
    }
    return false;
}

if (document.getElementById("oracleATGbrand") != null || isOldDynAdmin())
{
  try 
  {
   BDA.init();
  }
  catch(err)
  {
    console.log(err);
  }
}
else
{
    console.log("BDA script not starting");
}



