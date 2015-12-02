// ==UserScript==
// @name         Better Dynamo Administration
// @namespace    BetterDynAdmin
// @include      */dyn/admin/*
// @author       Jean-Charles Manoury
// @grant GM_getResourceText
// @grant GM_addStyle
// @version 1.8
// @require https://code.jquery.com/jquery-1.11.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.21.5/js/jquery.tablesorter.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/codemirror/4.8.0/codemirror.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/codemirror/4.8.0/mode/xml/xml.min.js
// @require https://raw.githubusercontent.com/vkiryukhin/vkBeautify/master/vkbeautify.js
// @require https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.8.0/highlight.min.js
// @require https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/select2/select2.min.js
// @resource bdaCSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/bda.css
// @resource cmCSS https://cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/codemirror.css
// @resource tablesorterCSS https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.21.5/css/theme.blue.min.css
// @resource hljsThemeCSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/highlight.js/github_custom.css
// @resource hlCSS https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.8.0/styles/default.min.css
// @resource select2CSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/select2/select2.css
// @resource select2BootCSS https://cdnjs.cloudflare.com/ajax/libs/select2-bootstrap-css/1.4.6/select2-bootstrap.css
// @resource fontAwsomeCSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/font-awsome/font-awesome.min.css
// @updateUrl https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
// @downloadUrl https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
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
    oldDynamoAltSelector : ["Dynamo Component Browser", "Dynamo Administration", "Performance Monitor", "Dynamo Batch Compiler", "Dynamo Configuration", "JDBC Browser"],
    defaultItemByTab : "10",
    hasWebStorage : false,
    hasErrors : false,
    hasResults : false,
    isOldDynamo : false,
    isPerfMonitorPage : false,
    isPerfMonitorTimePage : false,
    isXMLDefinitionFilePage : false,
    isServiceConfigurationPage : false,
    isExecuteQueryPage : false,
    xmlDefinitionMaxSize : 150000, // 100 Ko
    queryEditor : null,
    descriptorList : null,
    connectionPoolPointerComp : "/atg/dynamo/admin/jdbcbrowser/ConnectionPoolPointer/",
    dataSourceDir : "/atg/dynamo/service/jdbc/",
    dynAdminCssUri : "/dyn/admin/atg/dynamo/admin/admin.css",

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
        this.isServiceConfigurationPage = this.isServiceConfigurationPage();
        this.isExecuteQueryPage = this.isExecuteQueryPage();
        this.isComponentPage = this.isComponentPage();
        this.isActorChainPage = this.isActorChainPage();
        console.log("isPerfMonitorPage : " + this.isPerfMonitorPage + ", isPerfMonitorTimePage : " + this.isPerfMonitorTimePage);
        if (this.isOldDynamo) {
            this.logoSelector = "";
            for (var i = 0; i != this.oldDynamoAltSelector.length; i++)
            {
                if(i != 0)
                    this.logoSelector += ",";
                this.logoSelector += "img[alt='" + this.oldDynamoAltSelector[i] + "']";
            }
            console.log("OldDynamo logoSelector :" + this.logoSelector);
            this.fixCss();
        }

        console.log("Path : " + this.purgeSlashes($(location).attr('pathname')));
        console.log("isComponentPage : " + this.isComponentPage + " isActorChainPage : " + this.isActorChainPage + " IsOldDynamo : " + this.isOldDynamo);
        console.log("Page has results : " + this.hasResults + ". Page has errors : " + this.hasErrors);

        $.tablesorter.defaults.sortInitialOrder = 'desc';
        // Setup repository page
        if (this.isRepositoryPage())
            this.setupRepositoryPage();
        else if (this.isXMLDefinitionFilePage)
            this.setupRepositoryDefinitionFilePage();
        else if (this.isServiceConfigurationPage)
            this.setupServiceConfigurationPage();

        // Setup performance monitor
        if (this.isPerfMonitorPage)
            this.setupPerfMonitorPage();
        // Setup performance monitor time page
        if (this.isPerfMonitorTimePage)
            this.setupPerfMonitorTimePage();
        // Setup JDBC browser execute query
        if (this.isExecuteQueryPage)
            this.setupExecuteQueryPage();

        this.showComponentHsitory();
        this.createToolbar();
        this.createBackupPanel();
        this.createBugReportPanel();

        if (this.isComponentPage)
        {
            // Change page title
            this.setupPageTitle();
            // Setup find class link
            this.setupFindClassLink();
            // Collect history
            this.collectHistory();
            // Make search field visible
            $("#search").css("display", "inline");
        }
        else if (this.isActorChainPage)
        {
            this.createActorCaller();
        }
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
        var $componentBrowserH1 = $(this.componentBrowserPageSelector);
        if ($componentBrowserH1.size() > 0)
        {
            $componentBrowserH1.prev().remove();
            $(this.logoSelector).click(function (){
                window.location.href = "/dyn/admin";
            });
        }
    },

    loadExternalCss : function(url) 
    {
        var cmCSS = GM_getResourceText("cmCSS");
        GM_addStyle(cmCSS);
        var hlCSS = GM_getResourceText("hlCSS");
        GM_addStyle(hlCSS);
        var hljsThemeCSS = GM_getResourceText("hljsThemeCSS");
        GM_addStyle(hljsThemeCSS);
        var tablesorterCSS = GM_getResourceText("tablesorterCSS");
        GM_addStyle(tablesorterCSS);
        var fontAwsomeCSS = GM_getResourceText("fontAwsomeCSS");
        GM_addStyle(fontAwsomeCSS);
        var select2CSS = GM_getResourceText("select2CSS");
        GM_addStyle(select2CSS);
        var select2BootCSS = GM_getResourceText("select2BootCSS");
        GM_addStyle(select2BootCSS);
        var bdaCSS = GM_getResourceText("bdaCSS");
        GM_addStyle(bdaCSS);
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

    isExecuteQueryPage : function()
    {
        return $(location).attr('pathname').indexOf("executeQuery.jhtml") != -1;
    },

    isOldDynamo : function ()
    {
        for(var els = document.getElementsByTagName ('img'), i = els.length; i--;)
        {
            if (BDA.oldDynamoAltSelector.indexOf(els[i].alt) != -1)
                return true;
        }
        return false;
    },

    // Load default dyn admin CSS if needed
    fixCss : function()
    {
        if ($("link[href='" + this.dynAdminCssUri + "']").size() == 0)
        {
            console.log("Default dyn admin CSS is missing : " + this.dynAdminCssUri + ". Add it now.");
            var $link = $("<link />")
            .prop("href", this.dynAdminCssUri)
            .prop("type", "text/css")
            .prop("rel", "stylesheet");
            if($('head').size > 0)
                $('head').append($link);
            else
                $('body').append($link);
        } 
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

    isServiceConfigurationPage : function()
    {
        return location.search.indexOf("propertyName=serviceConfiguration") != -1;
    },

    isComponentPage : function ()
    {
        return $("h1:contains('Directory Listing')").size() == 0 //Page is not a directory
            && document.URL.indexOf('/dyn/admin/nucleus/') != -1 // Page is in nucleus browser
            && document.URL.indexOf("?") == -1; // Page has no parameter
    },

    isActorChainPage : function()
    {
        return $("h2:contains('Actor Chain:')").size() == 1 && document.URL.indexOf('chainId=') != -1;
    },

    rotateArrow : function ($arrow)
    {
        if ($arrow.hasClass("fa-arrow-down"))
            $arrow.removeClass("fa-arrow-down").addClass("fa-arrow-up");
        else
            $arrow.removeClass("fa-arrow-up").addClass("fa-arrow-down");
    },

    //---- Repository page -------------------------------------------------------------------------

    getToggleLabel : function(state)
    {
        if(state == 1)
            return "Show less...";
        return "Show more...";
    },

    toggleShowLabel : function (contentDisplay,selector)
    {
        if (contentDisplay == "none")
            $(selector).html("Show more...");
        else
            $(selector).html("Show less...");
    },

    toggleCacheUsage: function () 
    {
        var $cacheUsage = $(this.cacheUsageSelector);
        $cacheUsage.next().toggle().next().toggle();
        this.toggleShowLabel($cacheUsage.next().css("display"), "#showMoreCacheUsage");
        this.storeToggleState("showMoreCacheUsage", $cacheUsage.next().css("display"));
    },

    toggleRepositoryView : function () 
    {
        $(this.repositoryViewSelector).next().toggle().next().toggle();
        this.toggleShowLabel($(this.repositoryViewSelector).next().css("display"), "#showMoreRepositoryView");
        this.storeToggleState("showMoreRepositoryView", $(this.repositoryViewSelector).next().css("display"));
    },

    toggleProperties : function () 
    {
        $(this.propertiesSelector).next().toggle();
        this.toggleShowLabel($(this.propertiesSelector).next().css("display"), "#showMoreProperties");
        this.storeToggleState("showMoreProperties", $(this.propertiesSelector).next().css("display"));
    },

    toggleEventSets : function () 
    {
        $(this.eventSetsSelector).next().toggle();
        this.toggleShowLabel($(this.eventSetsSelector).next().css("display"), "#showMoreEventsSets");
        this.storeToggleState("showMoreEventsSets", $(this.eventSetsSelector).next().css("display"));
    },

    toggleMethods : function () 
    {
        $(this.methodsSelector).next().toggle();
        this.toggleShowLabel($(this.methodsSelector).next().css("display"), "#showMoreMethods");
        this.storeToggleState("showMoreMethods", $(this.methodsSelector).next().css("display"));
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
        var descriptors = [];
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
        descriptorOptions += "<option value=''>Select a descriptor...</option>"
        for (var i = 0; i != descriptors.length; i++)
            descriptorOptions += "<option value='" + descriptors[i] + "'>" + descriptors[i] + "</option>\n";
        return descriptorOptions;
    },

    getsubmitButton : function ()
    {
        return "<button type='button' id='RQLAdd'>Add</button>" 
            + "<button type='button' id='RQLGo'>Add & Enter <i class='fa fa-play fa-x'></i></button>";
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
            query += "<print-item id=\"" + ids[i].trim() + "\" item-descriptor=\"" + descriptor + "\" />\n";
        return query;
    },

    getRemoveItemQuery : function ()
    {
        var ids = this.getMultiId();
        var descriptor = $("#itemDescriptor").val();
        var query = "";
        for (var i = 0; i != ids.length; i++)
            query += "<remove-item id=\"" + ids[i].trim() + "\" item-descriptor=\"" + descriptor + "\" />\n";
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

    getAllItemQuery : function ()
    {
        var descriptor = $("#itemDescriptor").val();
        var query = "<query-items item-descriptor=\"" + descriptor + "\" >\n";
        query += "ALL\n"
        query += "</query-items>\n";
        return query;
    },

    getLast10ItemQuery : function ()
    {
        var descriptor = $("#itemDescriptor").val();
        var query = "<query-items item-descriptor=\"" + descriptor + "\" >\n";
        query += "ALL ORDER BY ID DESC RANGE 0+10\n"
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
        else if (action == "all")
            query = this.getAllItemQuery();
        else if (action == "last_10")
            query = this.getLast10ItemQuery();
        return query;
    },

    submitRQLQuery : function (addText)
    {
        if(addText)
        {
            var query = this.getRQLQuery();
            this.setQueryEditorValue(this.getQueryEditorValue() + query);
        }
        this.sanitizeQuery();
        this.storeSplitValue();
        // set anchor to the result div
        location.hash = '#RQLResults';
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
        baseId = this.sanitizeSelector(baseId);
        $("#" + baseId).toggle();
        $("#text_" + baseId).toggle();
    },

    // Escape '.', ':' in a jquery selector
    sanitizeSelector : function( id ) {
        return id.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
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

        var regexp = /<\!--(.*)(\<set\-property.*\>\<\!\[CDATA\[[\S\s]*?\]\]\>\<\/set\-property\>).*-->/ig;

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
            html += "<th>" + curProp.name + "<span class='prop_name'>";
            if (curProp.rdonly == "true")
                html += "<div class='prop_attr prop_attr_red'>R</div>";
            if (curProp.derived  == "true")
                html += "<div class='prop_attr prop_attr_green'>D</div>";
            if (curProp.exportable  == "true")
                html += "<div class='prop_attr prop_attr_blue'>E</div>";
            html += "</span></th>";

            for (var a = 0; a < datas.length; a++)
            {
                var propValue = datas[a][curProp.name];
                if (propValue != null)
                {
                    // Remove "_"
                    if(curProp.name == "descriptor")
                        propValue = propValue.substr(1);   
                    if (propValue.length > 25)
                    {
                        var base_id = curProp.name + "_" + datas[a]["id"];
                        var link_id = "link_" + base_id;
                        var field_id = "text_" + base_id;
                        propValue = "<a class='copyLink' href='javascript:void(0)' title='Show all' id='"+link_id+"' >"
                            + "<span id='"+base_id+"'>" + this.escapeHTML(propValue.substr(0, 25)) + "...</a>"
                            + "</span><textarea class='copyField' id='"+field_id+"' readonly>"+ propValue + "</textarea>";
                    }
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

    showXMLAsTab : function(xmlContent, $outputDiv)
    {
        var xmlDoc = $.parseXML("<xml>" + xmlContent  + "</xml>");
        var $xml = $(xmlDoc);
        var $addItems = $xml.find("add-item");
        var types = {};
        var datas = [];
        var nbTypes = 0;
        var typesNames = {};

        var log = $("<xml>" + xmlContent  + "</xml>")
        .children()
        .remove()
        .end()
        .text()
        .trim();

        $addItems.each(function () {
            var curItemDesc = "_" + $(this).attr("item-descriptor");
            if (types[curItemDesc] == null)
                types[curItemDesc] = [];
            if (typesNames[curItemDesc] == null)
                typesNames[curItemDesc] = [];
            if (datas[curItemDesc] == null)
            {
                datas[curItemDesc] = [];
                nbTypes++;
            }
            var curData = [];

            $(this).find("set-property").each(function (index) {

                var $curProp = $(this)
                curData[$curProp.attr("name")] = $curProp.text();
                var type = {};
                type.name = $curProp.attr("name");
                if ($.inArray(type.name, typesNames[curItemDesc]) == -1 ) 
                {
                    type.rdonly = $curProp.attr("rdonly");
                    type.derived = $curProp.attr("derived");
                    type.exportable = $curProp.attr("exportable");
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
        var html = "<p class='nbResults'>" + $addItems.size() + " items in " + nbTypes + " descriptor(s)</p>";
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
        $outputDiv.append(html);
        $outputDiv.prepend("<div class='prop_attr prop_attr_red'>R</div> : read-only "
                           + "<div class='prop_attr prop_attr_green'>D</div> : derived "
                           + "<div class='prop_attr prop_attr_blue'>E</div> : export is false");

        if ($(".copyField").size() > 0)
        {
            // reuse $outputDiv in case we have several results set on the page (RQL query + get item tool)
            $outputDiv.find("p.nbResults").append("<br><a href='javascript:void(0)' class='showFullTextLink'>Show full text</a>");
            $outputDiv.find(".showFullTextLink").click(function() {
                var dateStart = new Date().getTime();
                console.log("Start showFullText");
                $(".copyField").each(function() {
                    $(this).parent().html($(this).html());
                });
                var dateFullText = new Date();
                console.log("time to show full text : " + (dateFullText.getTime() - dateStart) + "ms");
                $(this).hide();
            });
        }
        var endRenderingTab = new Date();
        var time = endRenderingTab.getTime() - startRenderingtab;
        console.log("time to render tab : " + time + "ms");
        return log;
    },

    showRQLLog : function (log, error)
    {
        console.log("Execution log : " + log);
        if (log != null && log.length > 0)
        {
            $("<h3>Execution log</h3><div id='RQLLog'></div>").insertAfter("#RQLResults");
            var cleanLog = log.replace(/\n{2,}/g, '\n').replace(/------ /g, "").trim();
            $("#RQLLog").html(cleanLog);
        }
        if(error)
            $("#RQLLog").addClass("error");
    },

    showRQLResults : function ()
    {
        console.log("Start showRQLResults");
        // Add 'show raw xml' link
        var html = "<p>"
        + "<a href='javascript:void(0)' id='rawXmlLink'>Show raw xml</a>"
        + "</p>\n";
        html += "<p id='rawXml'></p>";
        $("#RQLResults").append(html);

        var xmlContent = $(this.resultsSelector).next().text().trim();
        xmlContent = this.sanitizeXml(xmlContent);
        var log = this.showXMLAsTab(xmlContent, $("#RQLResults"));
        this.showRQLLog(log, false);
        // Move raw xml
        $(this.resultsSelector).next().appendTo("#rawXml");
        $(this.resultsSelector).remove();

        $("#rawXmlLink").click(function() {
            BDA.toggleRawXml();
            var xmlSize = $("#rawXml pre").html().length;
            console.log("raw XML size : " + xmlSize);
            console.log("XML max size : " + BDA.xmlDefinitionMaxSize);  
            if (xmlSize < BDA.xmlDefinitionMaxSize)
            {
                $('#rawXml').each(function(i, block) {
                    hljs.highlightBlock(block);
                });
            }
            else
            {
                // Check if button already exists
                if ($("#xmlHighlight").size() == 0)
                {
                    $("<p id='xmlHighlight' />")
                        .html("The XML result is big, to avoid slowing down the page, XML highlight have been disabled. <br> <button id='xmlHighlightBtn'>Highlight XML now</button> <small>(takes few seconds)</small>")
                        .prependTo($("#rawXml"));
                    $("#xmlHighlightBtn").click(function() {
                        $('#rawXml pre').each(function(i, block) {
                            hljs.highlightBlock(block);
                        });
                    });
                }
            }
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
        this.showRQLLog(error, true);
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
            // this.setupFlowchart($("pre"));
            this.highlightAndIndentXml($("pre"));

        }
        else
        {
            $("<p />")
                .html("The definition file is big, to avoid slowing down the page, XML highlight and indentation have been disabled. <br> <button id='xmlHighlightBtn'>Highlight and indent now</button> <small>(takes few seconds)</small>")
                .insertAfter($("h3:contains('Value')"));

            $("#xmlHighlightBtn").click(function() {
                BDA.highlightAndIndentXml($("pre"));
            });
        }
    },

    propertiesDef : function(hljs) {
        console.log("propertiesDef");
        return {
            case_insensitive: true,
            contains: [
                {
                    className: 'comment',
                    begin: '#', end: '$'
                },
                {
                    className: 'setting',
                    begin: '^[a-z0-9\\[\\]_-]+[ \\t]*=[ \\t]*', end: '$',
                    contains: [
                        {
                            className: 'value',
                            endsWithParent: true,
                            keywords: 'on off true false yes no',
                            contains: [hljs.QUOTE_STRING_MODE, hljs.NUMBER_MODE],
                            relevance: 0
                        }
                    ]
                }
            ]
        };
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
                                        /*
                         c : [
                               {
                                 begin: /\\\\[\\s\\S]/, 
                                 relevance: 0
                                }
                         ],*/
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

    highlightAndIndentXml : function($elm)
    {
        var dateStart = new Date().getTime();
        console.log("Start highlightAndIndentXml");

        $elm.each(function(index) {
            var escapeXML = $(this).html();
            var unescapeXML = $('<div/>').html(escapeXML).text();
            // vkbeautify needs unescape XML to works
            unescapeXML = vkbeautify.xml(unescapeXML, 2);
            var dateIndent = new Date();
            console.log("time to indent : " + (dateIndent.getTime() - dateStart) + "ms");
            $(this)
            // remove previous XML content
                .empty()
            // add code tags
                .append("<code class='xml'></code>")
                .find("code")
            // set escape XML content, because highlight.js needs escape XML to works
                .text(unescapeXML);
        });

        $('pre code').each(function(i, block) {
            // Run highlight.js on each XML block
            hljs.highlightBlock(block);
            // Make component path clickable
            $(block).find("span.hljs-attribute:contains('jndi'), span.hljs-attribute:contains('repository')").each(function() {
                var $value = $(this).next();
                var url = "/dyn/admin/nucleus" + $value.text().replace(/\"/g, "");
                $value.wrap("<a target='_blank' class='clickable' href='" + url + "' ></a>");
                $value.append("<i class='fa fa-external-link'></i>");
            });
        });
        var dateEnd = new Date();
        var time = dateEnd.getTime() - dateStart;
        console.log("time to highlight and indent : " + time + "ms");
    },

    setupRepositoryPage : function ()
    {
        /*
      $("<div id='repoToolbar' />").insertAfter("h1:eq(1)");
      $("#repoToolbar").append("<button type='button'  href='?shouldInvokeMethod=invalidateCaches'>Invalidate Caches</button>");
      $("#repoToolbar").append("<button type='button'  href='?shouldInvokeMethod=restart'>Restart</button>");
       */
        // Move RQL editor to the top of the page
        var actionSelect = "<select id='RQLAction' class='js-example-basic-single' style='width:170px'>"
        + " <optgroup label='Empty queries'>"
        + "<option value='print-item'>print-item</option>"
        + "<option value='query-items'>query-items</option>"
        + "<option value='remove-item'>remove-item</option>"
        + "<option value='add-item'>add-item</option>"
        + "<option value='update-item'>update-item</option>"
        + "</optgroup>"
        + " <optgroup label='Predefined queries'>"
        + "<option value='all'>query-items ALL</option>"
        + "<option value='last_10'>query-items last 10</option>"
        + "</optgroup>"
        + "</select>";

        $(this.descriptorTableSelector).attr("id", "descriptorTable");

        $("<div id='RQLEditor'></div>").insertBefore("h2:first");
        $("<div id='RQLResults'></div>").insertBefore("#RQLEditor");
        if (this.hasErrors)
            this.showRqlErrors();
        if (this.hasResults && !this.hasErrors)
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
                                + "<span id='itemDescriptorField' > descriptor :  <select id='itemDescriptor' class='js-example-placeholder-single'>" + this.getDescriptorOptions() + "</select></span>"
                                + "</span>" 
                                + this.getsubmitButton() + "</div>");


        $("#RQLAction").select2({
            width : "style",
            minimumResultsForSearch: -1
        });

        $("#itemDescriptor").select2({
            placeholder: "Select a descriptor",
            allowClear: true,
            width : "element",
            matcher: function (params, data) {
                // If there are no search terms, return all of the data
                if ($.trim(params) === '') {
                    return data;
                }
                // `params.term` should be the term that is used for searching
                // `data.text` is the text that is displayed for the data object
                if (data.indexOf(params) == 0) {
                    var modifiedData = $.extend({}, data, true);
                    modifiedData.text += ' (matched)';
                    // You can return modified objects from here
                    // This includes matching the `children` how you want in nested data sets
                    return modifiedData;
                }
                return null;
            }
        });

        $("#RQLToolbar").after("<div id='RQLText'></div>");
        $("#xmltext").appendTo("#RQLText");
        $("#RQLText").after("<div id='storedQueries'></div>");
        $("#RQLText").after("<div id='descProperties'></div>");
        $("#RQLForm input[type=submit]").remove();

        var splitObj = this.getStoredSplitObj();
        var itemByTab = this.defaultItemByTab;
        var isChecked = false;
        if (splitObj != null)
            itemByTab = splitObj.splitValue;
        if (splitObj != null)
            isChecked = splitObj.activeSplit;

        var checkboxSplit =  "<input type='checkbox' id='noSplit' ";
        if (isChecked)
            checkboxSplit += " checked ";
        checkboxSplit += "/> don't split.";

        $("#storedQueries").after("<div id='RQLSave'>"
                                  + "<div style='display:inline-block;width:200px'><button id='clearQuery' type='button'>Clear <i class='fa fa-ban fa-x'></i></button></div>"
                                  + "<div style='display:inline-block;width:530px'>Split tab every :  <input type='text' value='" + itemByTab + "' id='splitValue'> items. "
                                  + checkboxSplit + "</div>"
                                  + "<button type='submit' id='RQLSubmit'>Enter <i class='fa fa-play fa-x'></i></button>"
                                  + "</div>"
                                  + "<div><input placeholder='Name this query' type='text' id='queryLabel'>&nbsp;<button type='button' id='saveQuery'>Save <i class='fa fa-save fa-x'></i></button></div>" 
                                 );

        this.showQueryList();
        this.queryEditor = CodeMirror.fromTextArea(document.getElementById("xmltext"), {lineNumbers: false});
        this.setupItemTreeForm();
        this.setupItemDescriptorTable();
        this.setupPropertiesTables();

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
            else
                BDA.getQueryItemsEditor();
        });

        $("#RQLSubmit").click(function() {
            BDA.submitRQLQuery(false);
        });

        $("#RQLGo").click(function() {
            BDA.submitRQLQuery(true);
        });

        $("#RQLAdd").click(function() {
            var query = BDA.getRQLQuery();
            var editor = BDA.queryEditor;
            var editorCursor = editor.getCursor();
            if(editorCursor.ch != 0)
                editor.setCursor(editor.getCursor().line + 1, 0);

            BDA.queryEditor.replaceSelection(query);
            BDA.showItemPropertyList($("#itemDescriptor").val());
        });

        $("#saveQuery").click(function() {
            if (BDA.getQueryEditorValue().trim() != "" && $("#queryLabel").val().trim() != "")
            {
                BDA.storeRQLQuery($("#queryLabel").val().trim(), BDA.getQueryEditorValue().trim());
                BDA.showQueryList();
            }
        });

        $("#clearQuery").click(function() {
            BDA.setQueryEditorValue("");
        });

        // Hide other sections
        var toggleObj = BDA.getToggleObj();

        var repositoryView  = "<a href='javascript:void(0)' id='showMoreRepositoryView' class='showMore'>" + this.getToggleLabel(toggleObj["showMoreRepositoryView"]) + "</a>";
        var cacheUsage  = "&nbsp;<a href='javascript:void(0)' id='showMoreCacheUsage' class='showMore'>" + this.getToggleLabel(toggleObj["showMoreCacheUsage"]) + "</a>";
        var properties  = "&nbsp;<a href='javascript:void(0)' id='showMoreProperties' class='showMore'>" + this.getToggleLabel(toggleObj["showMoreProperties"]) + "</a>";
        var eventSets  = "&nbsp;<a href='javascript:void(0)' id='showMoreEventsSets' class='showMore'>" + this.getToggleLabel(toggleObj["showMoreEventsSets"]) + "</a>";
        var methods  = "&nbsp;<a href='javascript:void(0)' id='showMoreMethods' class='showMore'>" + this.getToggleLabel(toggleObj["showMoreMethods"]) + "</a>";

        // Auto hide Repository View
        $(this.repositoryViewSelector).append(repositoryView);

        if (toggleObj.hasOwnProperty("showMoreRepositoryView") && toggleObj["showMoreRepositoryView"] == 0)
            this.toggleRepositoryView();
        $("#showMoreRepositoryView").click(function (){
            BDA.toggleRepositoryView();
        });
        // Auto hide Cache usage
        $(this.cacheUsageSelector).append(cacheUsage);
        if (toggleObj["showMoreCacheUsage"] != 1)
            this.toggleCacheUsage();
        $("#showMoreCacheUsage").click(function (){
            BDA.toggleCacheUsage();
        });
        // Auto hide Properties
        $(this.propertiesSelector).append(properties);
        if (toggleObj["showMoreProperties"] != 1)
            this.toggleProperties();
        $("#showMoreProperties").click(function (){
            BDA.toggleProperties();
        });
        // Auto hide Events Sets
        $(this.eventSetsSelector).append(eventSets);
        if (toggleObj["showMoreEventsSets"] != 1)
            this.toggleEventSets();
        $("#showMoreEventsSets").click(function (){
            BDA.toggleEventSets();
        });
        // Auto hide Methods
        $(this.methodsSelector).append(methods);
        if (toggleObj["showMoreMethods"] != 1)
            this.toggleMethods();
        $("#showMoreMethods").click(function (){
            BDA.toggleMethods();
        });
    },

    getToggleObj : function ()
    {
        var toggleObj;
        if(!this.hasWebStorage)
            return {};

        var toggleObj = localStorage.getItem('toggleObj');
        if (toggleObj != null && toggleObj != "")
            toggleObj = JSON.parse(toggleObj);
        else
            toggleObj = {};
        return toggleObj;
    },

    storeToggleState : function(toggle, cssState)
    {
        if(!this.hasWebStorage)
            return;
        var toggleState = 1;
        if(cssState == "none")
            toggleState = 0;
        var toggleObj = BDA.getToggleObj();
        toggleObj[toggle] = toggleState;
        localStorage.setItem('toggleObj', JSON.stringify(toggleObj));
    },

    showItemPropertyList : function(item)
    {
        console.log("showItemPropertyList");
        var componentURI = window.location.pathname;
        var url = componentURI + "?action=seetmpl&itemdesc=" + item + "#showProperties";
        $.get(url, function(data) {
            var $pTable = $(data).find("a[name='showProperties']").next();
            $pTable.find('th:nth-child(2), td:nth-child(2),th:nth-child(4), td:nth-child(4),th:nth-child(5), td:nth-child(5),th:nth-child(6), td:nth-child(6)').remove();
            $("#storedQueries").css("display", "none");
            var $scrollDiv = $("<div class='scrollableTab'></div>").append($pTable);
            $("#descProperties")
                .empty()
                .append($scrollDiv)
                .append("<p class='showQueriesLabel'><a href='javascript:void(0)' id='showStoredQueries'>Show stored queries</a></p>")
                .css("display", "inline-block");

            $("#showStoredQueries").click(function() {
                console.log("show stored queries");
                $("#descProperties").css("display", "none");
                $("#storedQueries").css("display", "inline-block");
            });

        });
    },

    setupPageTitle : function()
    {
        $("title").text(this.getComponentNameFromPath(this.getCurrentComponentPath()));
    },

    setupFindClassLink : function()
    {
        var $classLink = null;
        if (this.isOldDynamo)
            $classLink = $("h1:eq(0)").next();
        else
            $classLink = $("h1:eq(1)").next();
        var className = $classLink.text();
        $("<span style='margin-left : 25px'><a href='/dyn/admin/atg/dynamo/admin/en/findclass.jhtml?className="+className+"&debug=true'>Find Class</a></span>")
            .insertAfter($classLink);
    },

    setupPropertiesTables : function()
    {
        if ($("a[name=showProperties]").size() > 0)
        {
            $("a[name=showProperties]").next().attr("id", "propertiesTable");
            $("#propertiesTable").find("tr:nth-child(odd)").addClass("odd");
        }
    },

    setupItemDescriptorTable : function ()
    {
        var descriptors = this.getDescriptorList();
        var componentURI = window.location.pathname;
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
            if ($("a[href='" + componentURI + "?action=clriddbg&itemdesc=" + descriptors[i] + "#listItemDescriptors']").size() > 0)
                isDebugEnable = true;
            html += "<td class='descriptor'>" + descriptors[i] + "</td>";
            html += "<td><a class='btn-desc' href='" + componentURI + "?action=seetmpl&itemdesc=" + descriptors[i] + "#showProperties'>Properties</a>";
            html += "&nbsp;<a class='btn-desc' class='btn-desc' href='" + componentURI + "?action=seenamed&itemdesc=" + descriptors[i] + "#namedQuery'>Named queries</a></td>";

            html += "<td>";
            if (isDebugEnable)
                html += "<a class='btn-desc red' href='" + componentURI + "?action=clriddbg&itemdesc=" + descriptors[i] + "#listItemDescriptors'>Disable</a>";
            else
            {
                html += "<a class='btn-desc' href='" + componentURI + "?action=setiddbg&itemdesc=" + descriptors[i] + "#listItemDescriptors'>Enable</a>";
                html += "&nbsp;<a class='btn-desc' href='" + componentURI + "?action=dbgprops&itemdesc=" + descriptors[i] + "#debugProperties'>Edit</a>";
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
            var rqlQueries = this.purgeRQLQuery(this.getStoredRQLQueries());
            if (rqlQueries != null && rqlQueries.length > 0)
            {
                html += "<span class='storedQueriesTitle'>Stored queries :</span>";
                html += "<ul>"
                for (var i = 0; i != rqlQueries.length; i++)
                {
                    var storeQuery = rqlQueries[i];
                    html += "<li class='savedQuery'>";
                    html += "<a href='javascript:void(0)'>" + storeQuery.name + "</a>"
                    html += "<span id='deleteQuery" + i + "'class='deleteQuery'>";
                    html += "<i class='fa fa-trash-o'></i>";
                    html += "</span>";
                    html += "</li>";
                }
                html += "</ul>";
            }
        }
        $("#storedQueries").html(html);
        $(".savedQuery").click(function() {
            console.log("click on query : " + $(this).find("a").html());
            BDA.printStoredQuery( $(this).find("a").html());
        });

        $(".savedQuery").hover( function() {
            $(this).find("span.deleteQuery").toggle();
        }, function() {
            $(this).find("span.deleteQuery").toggle();
        });

        $(".deleteQuery")
            .click(function() {
            var index = this.id.replace("deleteQuery", "");
            console.log("Delete query #" + index);
            BDA.deleteRQLQuery(index);
            BDA.reloadQueryList();
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
            storeQuery.repo = BDA.getComponentNameFromPath(BDA.getCurrentComponentPath());
            var rqlQueries = this.getStoredRQLQueries();
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
    purgeRQLQuery : function (rqlQueries)
    {
        // Purge query 
        var purgedRqlQueries = [];
        for (var i = 0; i != rqlQueries.length; i++)
        {
            var query = rqlQueries[i];
            if (!query.hasOwnProperty("repo") || query.repo == BDA.getComponentNameFromPath(BDA.getCurrentComponentPath())) {
                purgedRqlQueries.push(rqlQueries[i]);
            }
        }
        return purgedRqlQueries;
    },

    reloadQueryList : function ()
    {
        $("#storedQueries").empty();
        this.showQueryList();
    },

    printStoredQuery : function (name)
    {
        console.log("printStoredQuery : " + name);
        var rqlQueries = this.getStoredRQLQueries();
        console.log(rqlQueries);
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
        if (document.URL.indexOf("#") >= 0)
            return ;

        var componentPath = this.purgeSlashes(document.location.pathname);
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
            html += "<a href='" + comp + "'>" + this.getComponentNameFromPath(comp) + "</a>";
        }
        $("#history").html(html);
    },

    //--- Bug report panel

    createBugReportPanel : function() 
    {
        var labels = ["Found a bug in BDA ?", "Want a new feature ?", "What's new in BDA ?"];
        var labelIndex = Math.floor((Math.random() * labels.length)); 

        $("<div id='bdaBug'></div>").appendTo("body")
            .html("<p>" + labels[labelIndex] + "</p>"
                  + "<div class='bugArrow'><i class='up fa fa-arrow-down'></i></div>"
                 );

        $("<div id='bdaBugPanel'></div>").appendTo("body")
            .html("<p>How can I help and stay tuned ? "
                  + "<br /><br /> Better Dyn Admin have a <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin'>GitHub page</a>. <br>"
                  + "Please report any bug in the <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin/issues'>issues tracker</a>. Of course, you can also request new feature or suggest enhancement !"
                  + "<br /><br /> Stay tuned, look at the <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin/milestones'>incoming milestones</a>."
                  + "<br /><br /> <strong> BDA version " + GM_info.script.version + "</strong> </p>"
                 );

        $("#bdaBug").click(function() {
            $("#bdaBugPanel").slideToggle();
            BDA.rotateArrow($(".bugArrow i"));
            if ($("#bdaBackupPanel").css("display") != "none")
            {
                $("#bdaBackupPanel").slideToggle();
                BDA.rotateArrow($(".backupArrow i"));
            }
        });


    },

    //--- backup panel functions ------------------------------------------------------------------------

    createBackupPanel : function ()
    {
        $("<div id='bdaBackup'></div>").appendTo("body")

            .html("<p>Backup / restore data</p>"
                  + "<div class='backupArrow'><i class='up fa fa-arrow-down'></i></div>"
                 );

        $("#bdaBackup").click(function() {
            $("#bdaBackupPanel").slideToggle();
            BDA.rotateArrow($(".backupArrow i"));
            if ($("#bdaBugPanel").css("display") != "none")
            {
                $("#bdaBugPanel").slideToggle();
                BDA.rotateArrow($(".bugArrow i"));
            }
        });

        $("<div id='bdaBackupPanel'></div>").appendTo("body")

            .html("<p>Why should I save Better Dyn Admin data ? "
                  + "<br /><br /> Because BDA use javascript local storage. You will lose your favorite components and your stored queries if you clean your browser."
                  + "<br /><br /><strong> Remenber that you can also import your backup to a BDA in another domain !</strong> </p>"

                  + "<textarea id='bdaData' placeholder='Paste your data here to restore it.'></textarea>"
                  + "<button id='bdaDataBackup'>Backup</button>"
                  + "<button id='bdaDataRestore'>Restore</button>"
                 );

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

        if(storedComp.length > 0 && this.idsSet(storedComp))
            storedComp = this.generateCompIds(storedComp);
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
        localStorage.setItem('Components', JSON.stringify(storedComponents));
        return storedComponents;
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
            var storedComp = this.getStoredComponents();
            if (storedComp.length > 0)
                compObj.id = storedComp[storedComp.length - 1].id + 1;
            console.log("id : " + compObj.id);
            storedComp.push(compObj);

            localStorage.setItem('Components', JSON.stringify(storedComp));
        }
    },

    getComponentNameFromPath : function (componentPath)
    {
        // Strip last slash if any
        if (componentPath[componentPath.length - 1] == "/")
            componentPath = componentPath.substr(0 , componentPath.length - 1);

        var tab = componentPath.split("/");
        //console.log("For component :" + componentPath + ", name is : " + (tab[tab.length - 1]));
        return tab[tab.length - 1];
    },

    purgeSlashes : function(str)
    {
        return str.replace(/([^:]\/)\/+/g, "$1");
    },

    getComponentShortName : function (componentName)
    {
        var shortName = "";
        for(var i = 0; i != componentName.length; i++)
        {
            var character = componentName[i];
            if (character == character.toUpperCase() && character != ".")
                shortName += character;
        }
        // TODO : return 3 first letter if shortName is empty
        return shortName;
    },

    getCurrentComponentPath : function()
    {
        return this.purgeSlashes(document.location.pathname.replace("/dyn/admin/nucleus", ""));
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

        $("<div id='toolbarContainer'></div>").insertAfter(this.logoSelector);
        $("<div id='toolbar'></div>").appendTo("#toolbarContainer");

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
                      + "<div class='favArrow' id='favArrow" + fav.id + "'><i class=' up fa fa-arrow-down'></i></div>"
                      + "<div class='favMoreInfo' id='favMoreInfo" + fav.id + "'>"
                      + "<div class='favLogDebug'>"
                      + " <form method='POST' action='" + fav.componentPath + "' id='logDebugForm" + fav.componentName + "'>"
                      + "<input type='hidden' value='loggingDebug' name='propertyName'>"
                      + "<input type='hidden' value='' name='newValue'>"
                      + "logDebug : "
                      + "<a href='javascript:void(0)' class='logdebug' id ='logDebug" + fav.componentName + "'>true</a>"
                      + "&nbsp; | &nbsp;"
                      + "<a href='javascript:void(0)' class='logdebug' id ='logDebug" + fav.componentName + "'>false</a>"
                      +"</div>"
                      + "<div class='favDelete' id='delete" + fav.componentName + "'><i class='fa fa-trash-o'></i> Delete</div>"
                      + "</div>")
                .appendTo("#toolbar");
        }

        $(".favArrow").click(function() {
            console.log("Click on arrow");
            var id = this.id;
            var idToExpand = "#" + id.replace("favArrow", "favMoreInfo");
            $(idToExpand).slideToggle();
            BDA.rotateArrow($("#" + id + " i"));

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


        if (this.isComponentPage)
        {
            var componentPath = this.purgeSlashes(document.location.pathname);
            if (!this.isComponentAlreadyStored(componentPath))
            {
                $("<div class='newFav'><a href='javascript:void(0)' id='addComponent' title='Add component to toolbar'>+</a></div>")
                    .appendTo("#toolbar");
                $(".newFav").click(function() {
                    console.log("Add component");
                    BDA.storeComponent(componentPath);
                    BDA.reloadToolbar();
                });
            }
        }
    },
    
    createActorCaller : function()
    {
            var componentPathName = this.getCurrentComponentPath();
            var tableActor = $('table:first');
            var tableActorHeaderRow = tableActor.find('tr:first');
            var tableActorHeaderColumns = tableActorHeaderRow.find('th');
            var tableActorHeaderColumnsCount = tableActorHeaderColumns.size();
            var tableActorDataRow = tableActor.find('tr:eq(1)');
            var tableActorDataRowCells = tableActorDataRow.find('td');
            var actorChainIdValueLabel = tableActorDataRowCells.filter(function(index, element){return $(element).text() === "method"});
            var actorChainIdValue = actorChainIdValueLabel.next('td').text();

            var inputsHeader = tableActorHeaderColumns.filter(function(index, element){return $(element).text() === "Inputs"});
            var inputsIndex = $(inputsHeader).index();
            var tableInputs = $(tableActorDataRow.children().get(inputsIndex)).children().get(0);
            var inputs = [];
            if(tableInputs !== undefined)
            {
                var inputRows = $(tableInputs).find('tr');
                var inputsSize = inputRows.size();
                for(var i = 1; i < inputsSize; i++)
                {
                    var inputRow = $(inputRows.get(i));
                    var name = $(inputRow.children().get(0));
                    var value = $(inputRow.children().get(1));
                    var isNucleus = value.text().indexOf("nucleus") != -1;
                    if(!isNucleus)
                    {
                        inputs.push(name.text());
                    }
                }
            }
            var inputsHTML = "";
            for(input in inputs)
            {
                inputsHTML += inputs[input] + " <textarea name='" + inputs[input] + "'></textarea><br />";
            }
            var url = window.location.origin + '/rest/model' + componentPathName + actorChainIdValue;
            tableActor.after("<div id='actorChainCall' border><br /><h3>Call actor</h3><br /><a href='#' onclick=\"window.prompt('Copy to clipboard: Ctrl+C, Enter', '" + url + 
            "')\">click to copy url in clipboard</a>"  + "<br />post parameters are " + inputs + "<br /><form method='POST' action='/rest/model" + 
            componentPathName + actorChainIdValue + "'>" + inputsHTML + "<input type='submit' value='send'></form></div>");
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
        $tabSelector.tablesorter({
            'theme' : 'blue',  
            'widgets' : ["zebra"],
            'widgetOptions' : {
                zebra : [ "normal-row", "alt-row" ]
            }
        }); 
    },

    setupExecuteQueryPage : function()
    {
        $("<div  id='switchDataSource'/>")
            .append("<p>Query will be execute in data source : <span id='curDataSourceName' > " + this.getCurrentDataSource() + " </span></p>")
            .append("<p>Switch data source to : <select id='newDataSource'>" + this.getAvailableDataSource() + "</select><button id='switchDataSourceBtn'>Enter <i class='fa fa-play fa-x'></i></button></p>")
            .insertAfter($("h1:contains('Execute Query')"));
        $("textarea").prop("id", "sqltext");
        if ($("table").size() > 0)
            $("table").prop("id", "sqlResult");

        $("#switchDataSourceBtn").click(function(){
            var selectedDataSource = $("#newDataSource").val();
            $.ajax({
                type: "POST",
                url : "/dyn/admin/nucleus" + BDA.connectionPoolPointerComp,
                data : {"newValue" : BDA.dataSourceDir + selectedDataSource, "propertyName" : "connectionPool"},
                async : false
            });
            window.location.reload();
        });
    },

    getAvailableDataSource : function()
    {
        var datasources = [];
        var url = "/dyn/admin/nucleus" + this.dataSourceDir; 
        $.ajax({
            url : url,
            success : function(data) {
                $(data)
                    .find("h3 a")
                    .each(function(index, value) {
                    var strValue = $(value).text();
                    if (strValue != null && strValue != "DataSourceInfoCache" && strValue.indexOf("DataSource") != -1)
                        datasources += "<option>" + strValue + "</option>";
                });
            },
            async : false
        });
        return datasources;
    },

    getCurrentDataSource : function()
    {
        var datasource;
        var url = "/dyn/admin/nucleus" + this.connectionPoolPointerComp; 
        $.ajax({
            "url" : url, 
            "success" : function(data) {
                datasource = $(data)
                    .find("a:contains('connectionPoolName')")
                    .parent()
                    .next()
                    .find("span")
                    .text();
                console.log(datasource);
            },
            "async" : false
        });
        return datasource;
    },

    //--- Item Tree functions ------------------------------------------------------------------------

    setupItemTreeForm : function()
    {
        $("<div id='itemTree' />").insertAfter("#RQLEditor");
        $("#itemTree").append("<h2>Get Item Tree</h2>");
        $("#itemTree").append("<p>This tool will recursively retrieve items and print the result with the chosen output. \
<br> For example, if you give an order ID in the form below, you will get all shipping groups, payment groups, commerceItems, priceInfo... of the given order\
<br><b> Be careful when using this tool on a live instance ! Set a low max items value.</b></p>");

        $("#itemTree").append("<div id='itemTreeForm'>\
id : <input type='text' id='itemTreeId' /> &nbsp;\
descriptor :  <select id='itemTreeDesc'>" + this.getDescriptorOptions() + "</select>&nbsp;\
max items : <input type='text' id='itemTreeMax' value='50' /> &nbsp;<br><br>\
output format :  <select id='itemTreeOutput'><option value='HTMLtab'>HTML tab</option><option value='addItem'>add-item XML</option><option value='removeItem'>remove-item XML</option><option value='printItem'>print-item XML</option></select>&nbsp;\
<input type='checkbox' id='printRepositoryAttr' /><label for='printRepositoryAttr'>Print attribute : </label><pre style='margin:0; display:inline;'>repository='"+ this.getCurrentComponentPath() + "'</pre> <br><br>\
<button id='itemTreeBtn'>Enter <i class='fa fa-play fa-x'></i></button>\
</div>");
        $("#itemTree").append("<div id='itemTreeCount' />");
        $("#itemTree").append("<div id='itemTreeResult' />");
        $("#itemTreeBtn").click(function() {
            var descriptor = $("#itemTreeDesc").val();
            var id = $("#itemTreeId").val().trim();
            var maxItem = parseInt($("#itemTreeMax").val());
            var outputType = $("#itemTreeOutput").val();
            var printRepoAttr = $("#printRepositoryAttr").is(':checked');
            console.log("max item : " + maxItem);
            BDA.getItemTree(id, descriptor, maxItem, outputType, printRepoAttr);
        });

    },

    getRepositoryXmlDef : function()
    {
        var url = location.protocol + '//' + location.host + location.pathname + "?propertyName=definitionFiles";
        console.log(url);
        var rawXmlDef = "";
        jQuery.ajax({
            url:     url,
            success: function(result) {
                rawXmlDef = $(result).find("pre")
                    .html()
                    .trim()
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace("&nbsp;", "")
                    .replace("<!DOCTYPE gsa-template SYSTEM \"dynamosystemresource:/atg/dtds/gsa/gsa_1.0.dtd\">", "");
            },
            async:   false
        });
        var xmlDoc = jQuery.parseXML(rawXmlDef);
        return $(xmlDoc);
    },

    getSubItems : function(item, $xmlDef, itemTree, maxItem)
    {
        var rawItemXml;
        var subItems = [];
        var nbItem =  Object.keys(itemTree).length;
        console.log("maxItem : " + maxItem + ", nbItem : " + nbItem);
        if(nbItem >= maxItem)
        {
            // console.log("max Item ("+maxItem+") reached, stopping recursion");
            return;
        }
        //console.log("get sub items for : " + item.id + ", desc : " + item.desc);
        $.ajax({
            type: "POST",
            url: document.URL,
            data: { xmltext: "<print-item id='" + item.id + "' item-descriptor='" + item.desc + "' />"},
            success: function(result) {

                rawItemXml = $(result).find("code").html();
                // remove first 2 lines
                var tab = rawItemXml.split("\n");
                tab.splice(0,2); 
                rawItemXml = tab.join("\n").trim();
                // unescape HTML
                rawItemXml = rawItemXml.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            },
            async:   false
        });


        var xmlDoc = jQuery.parseXML(rawItemXml);
        var $itemXml = $(xmlDoc);
        //console.log("Add item to item tree : " + rawItemXml);
        itemTree[item.id] =  rawItemXml;
        $("#itemTreeCount").html("<p>" + nbItem + " items already retrieved</p>");

        var descriptor = $itemXml.find("add-item").attr("item-descriptor");
        var $itemDesc = $xmlDef.find("item-descriptor[name=" + descriptor + "]");
        var superType = $itemDesc.attr("super-type");
        while(superType != undefined)
        {
            var $parentDesc = $xmlDef.find("item-descriptor[name=" + $itemDesc.attr("super-type") + "]");
            // console.log("Add super type : " + $parentDesc.attr("name"));
            $itemDesc = $itemDesc.add($parentDesc);
            superType = $parentDesc.attr("super-type");
        }
        // One to One relation
        $itemDesc.find('property[item-type]')
            .each(function(index, elm) {
            var $elm = $(elm);
            var subProperty = $elm.attr("name");
            //console.log(subProperty);
            var subId = $itemXml.find("set-property[name="+subProperty+"]").text()
            if ($elm.attr("repository") == undefined && subId != "")
            {
                // avoid infinite recursion
                if(!itemTree.hasOwnProperty(subId)) 
                {
                    console.log({'id' : subId, 'desc' : $elm.attr("item-type")});
                    subItems.push({'id' : subId, 'desc' : $elm.attr("item-type")});
                }
            }
        });

        // One to Many relation with list, array or map
        $itemDesc.find('property[component-item-type]')
            .each(function(index, elm) {
            var $elm = $(elm);
            var subProperty = $elm.attr("name");
            // console.log(subProperty);
            var subId = $itemXml.find("set-property[name="+subProperty+"]").text()

            if ($elm.attr("repository") == undefined && subId != "")
            {
                var desc = $elm.attr("component-item-type");
                if(subId.indexOf(",") != -1 || subId.indexOf("=") != -1 )
                {
                    var splitChar = ",";
                    if(subId.indexOf("=") != -1)
                        splitChar = "=";
                    var ids = subId.split(splitChar);
                    for(var i = 0; i != ids.length; i++)
                    {
                        if(!itemTree.hasOwnProperty(subId)) 
                            subItems.push({'id' : ids[i], 'desc' : desc});
                    }
                }
                else
                {
                    if(!itemTree.hasOwnProperty(subId)) 
                        subItems.push({'id' : subId, 'desc' : desc});
                }
            }
        });

        for(var i in subItems)
        {
            BDA.getSubItems(subItems[i], $xmlDef, itemTree, maxItem);
        }
        return subItems;
    },

    getItemTree : function(id, descriptor, maxItem, outputType, printRepoAttr)
    {
        console.log("getItemTree - start");
        var startGettingTree = new Date().getTime();
        var $xmlDef = BDA.getRepositoryXmlDef();

        console.log("descriptor : " + $xmlDef.find("item-descriptor").size());
        // reset divs
        $("#itemTreeResult").empty();
        $("#itemTreeCount").empty();

        // get tree
        var itemTree = {};
        BDA.getSubItems({'id' : id, 'desc' : descriptor}, $xmlDef, itemTree, maxItem);
        $("#itemTreeCount").html("<p>" + Object.keys(itemTree).length + " items retrieved</p>");

        var endGettingTree = new Date();
        var time = endGettingTree.getTime() - startGettingTree;
        console.log("time to get item tree : " + time + "ms");

        // print result
        var res = "";
        if(outputType == "addItem")
        {
            for(id in itemTree)
            {
                if (printRepoAttr)
                {
                    var xmlDoc = jQuery.parseXML(itemTree[id]);
                    var $itemXml = $(xmlDoc).find("add-item");
                    $itemXml.attr("repository", BDA.getCurrentComponentPath());
                    res += $itemXml[0].outerHTML;
                }
                else
                    res += itemTree[id];
                res += "\n\n";
            }
            $("#itemTreeResult").append("<pre />");
            $("#itemTreeResult pre").text(res);
        }
        else if (outputType == "HTMLtab")
        {
            for(id in itemTree)
                res += itemTree[id];
            BDA.showXMLAsTab(res, $("#itemTreeResult"));
        }
        else if (outputType == "removeItem" || outputType == "printItem")
        {
            for(id in itemTree)
            {
                var xmlDoc = jQuery.parseXML(itemTree[id]);
                var $itemXml = $(xmlDoc).find("add-item");
                res += "<";
                if (outputType == "removeItem")
                    res += "remove-item";
                else
                    res += "print-item";
                res += ' id="' + $itemXml.attr("id") + '" item-descriptor="' +  $itemXml.attr("item-descriptor") + "\"";
                if (printRepoAttr)
                    res += " repository='"+ BDA.getCurrentComponentPath() +"'";
                res += ' />\n';
            }
            $("#itemTreeResult").append("<pre />");
            $("#itemTreeResult pre").text(res);
        }

    }
};

if (document.getElementById("oracleATGbrand") != null || BDA.isOldDynamo())
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

