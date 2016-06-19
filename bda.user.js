// ==UserScript==
// @name         Better Dynamo Administration
// @namespace    BetterDynAdmin
// @include      */dyn/admin/*
// @author       Jean-Charles Manoury
// @contributor  Benjamin Descamps
// @contributor  Joël Trousset
// @homepageURL  https://github.com/jc7447/BetterDynAdmin
// @supportURL   https://github.com/jc7447/BetterDynAdmin/issues
// @description  Refreshing ATG Dyn Admin
// @grant GM_getResourceText
// @grant GM_addStyle
// @grant window.focus
// @grant GM_setClipboard
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
//
// ------ write version on bdaCSS TOO ! ------
// @version 1.18
// @resource bdaCSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/bda.css?version=1.18


// @require https://code.jquery.com/jquery-1.11.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.21.5/js/jquery.tablesorter.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/codemirror/4.8.0/codemirror.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/codemirror/4.8.0/mode/xml/xml.min.js
// @require https://raw.githubusercontent.com/vkiryukhin/vkBeautify/master/vkbeautify.js
// @require https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.8.0/highlight.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/vis/4.15.0/vis.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js
// @resource cmCSS https://cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/codemirror.css
// @resource tablesorterCSS https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.21.5/css/theme.blue.min.css
// @resource hljsThemeCSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/highlight.js/github_custom.css
// @resource hlCSS https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.8.0/styles/default.min.css
// @resource select2CSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/select2/select2.css
// @resource select2BootCSS https://cdnjs.cloudflare.com/ajax/libs/select2-bootstrap-css/1.4.6/select2-bootstrap.css
// @resource fontAwsomeCSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/font-awsome/font-awesome.min.css
// @resource visCSS https://cdnjs.cloudflare.com/ajax/libs/vis/4.15.0/vis.min.css
// @resource whatsnew https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/WHATSNEW.md

// -- BDA plugins after all the libraries --
// @require https://raw.githubusercontent.com/jc7447/bda/dev/bda.common.js
// @require https://raw.githubusercontent.com/jc7447/bda/dev/bda.menu.js
// @require https://raw.githubusercontent.com/jc7447/bda/dev/bda.repository.js
// @require https://raw.githubusercontent.com/jc7447/bda/dev/bda.pipeline.js

// @updateUrl https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
// @downloadUrl https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
// ==/UserScript==

jQuery(document).ready(function() {
  (function($) {
    console.log('before BDA');

    var BDA = {
      componentBrowserPageSelector : "h1:contains('Component Browser')",
      logoSelector : "div#oracleATGbrand",
      oldDynamoAltSelector : ["Dynamo Component Browser", "Dynamo Administration", "Performance Monitor", "Dynamo Batch Compiler", "Dynamo Configuration", "JDBC Browser"],
      hasWebStorage : false,
      isOldDynamo : false,
      isComponentPage : false,
      isPerfMonitorPage : false,
      isPerfMonitorTimePage : false,
      isXMLDefinitionFilePage : false,
      isServiceConfigurationPage : false,
      isExecuteQueryPage : false,
      connectionPoolPointerComp : "/atg/dynamo/admin/jdbcbrowser/ConnectionPoolPointer/",
      dataSourceDir : "/atg/dynamo/service/jdbc/",
      dynAdminCssUri : "/dyn/admin/atg/dynamo/admin/admin.css",
      GMValue_MonoInstance: "monoInstance",
      GMValue_Backup:"backup",
      STORED_CONFIG : "BdaConfiguration",
      isLoggingTrace : false,

      init : function()
      {
        var start = new Date().getTime();
        console.log("Start BDA script");
        this.loadExternalCss();
        this.isOldDynamo = this.isOldDynamoFct();
        this.isPerfMonitorPage = this.isPerfMonitorPageFct();
        this.isPerfMonitorTimePage = this.isPerfMonitorTimePageFct();
        this.isXMLDefinitionFilePage = this.isXMLDefinitionFilePageFct();
        this.isServiceConfigurationPage = this.isServiceConfigurationPageFct();
        this.isExecuteQueryPage = this.isExecuteQueryPageFct();
        this.isComponentPage = this.isComponentPageFct();
        this.isActorChainPage = this.isActorChainPageFct();
        this.hasWebStorage = this.hasWebStorageFct();
        //this.isRepositoryPage = this.isRepositoryPageFct();

        console.log("isPerfMonitorPage : " + this.isPerfMonitorPage + ", isPerfMonitorTimePage : " + this.isPerfMonitorTimePage);
        if (this.isOldDynamo) {
          this.logoSelector = "";
        for (var i = 0; i != this.oldDynamoAltSelector.length; i++)
          {
            if(i !== 0)
             this.logoSelector += ",";
            this.logoSelector += "img[alt='" + this.oldDynamoAltSelector[i] + "']";
          }
          console.log("OldDynamo logoSelector :" + this.logoSelector);
          this.fixCss();
        }

        console.log("Path : " + this.purgeSlashes($(location).attr('pathname')));
        console.log("isComponentPage : " + this.isComponentPage + " IsOldDynamo : " + this.isOldDynamo);
        console.log("BDA monoInstance mode : " + (GM_getValue(BDA.GMValue_MonoInstance) === true));

        $.tablesorter.defaults.sortInitialOrder = 'desc';

        if(GM_getValue(BDA.GMValue_MonoInstance) === true)
          BDA.restoreData(GM_getValue(BDA.GMValue_Backup), false);

          $().bdaRepository(BDA);

          if (BDA.isXMLDefinitionFilePage)
            BDA.setupRepositoryDefinitionFilePage();
          else if (BDA.isServiceConfigurationPage)
            BDA.setupServiceConfigurationPage();

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
        this.reloadData();
        /*this.createMenu();*/
        $().bdaMenu(BDA,{});

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
            this.createActorCaller();

        // Handle escape key press
        $(document).keyup(function(e) {
          if (e.keyCode == 27) {
            // Close add component pop-up
            $('.popup_block').fadeOut();
            // Close panels
            if ($("#bdaBackupPanel").css("display") != "none")
            {
              $("#bdaBackupPanel").slideToggle();
              BDA.rotateArrow($(".backupArrow i"));
            }
            if ($("#bdaBugPanel").css("display") != "none")
            {
              $("#bdaBugPanel").slideToggle();
              BDA.rotateArrow($(".backupArrow i"));
            }
         }
        });

        // Monitor execution time
        var endTime = new Date();
        var time = endTime.getTime() - start;
        if (time > 1000)
          console.log("BDA takes : " + (time / 1000) + "sec");
        else
          console.log("BDA takes : " + time + "ms");
      },

      setupFindClassLink : function()
      {
        var $classLink = null;
        if (BDA.isOldDynamo)
          $classLink = $("h1:eq(0)").next();
        else
         $classLink = $("h1:eq(1)").next();
        var className = $classLink.text();
        $("<span style='margin-left : 25px'><a href='/dyn/admin/atg/dynamo/admin/en/findclass.jhtml?className="+className+"&debug=true'>Find Class</a></span>")
        .insertAfter($classLink);
      },

      setupXMLDefinitionFilePage : function()
      {
        var xmlSize = 0;
        $("pre").each(function(index) {
          xmlSize += $(this).html().length;
        });
        console.log("Xml size : " + xmlSize);
        if (xmlSize < BDA.xmlDefinitionMaxSize)
        {
          BDA.highlightAndIndentXml($("pre"));
        }
        else
        {
          $("<p />")
          .html("The definition file is big, to avoid slowing down the page, XML highlight and indentation have been disabled. <br>"
              + "<button id='xmlHighlightBtn'>Highlight and indent now</button> <small>(takes few seconds)</small>")
          .insertAfter($("h3:contains('Value')"));

          $("#xmlHighlightBtn").click(function() {
            BDA.highlightAndIndentXml($("pre"));
          });
        }
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
        var visCSS = GM_getResourceText("visCSS");
        GM_addStyle(visCSS);
      },

      //--- Page informations ------------------------------------------------------------------------
      isPerfMonitorPageFct : function()
      {
        return $(location).attr('pathname').indexOf("performance-monitor.jhtml") != -1;
      },

      isPerfMonitorTimePageFct : function()
      {
        return $(location).attr('pathname').indexOf("performance-data-time.jhtml") != -1;
      },

      isExecuteQueryPageFct : function()
      {
        return $(location).attr('pathname').indexOf("executeQuery.jhtml") != -1;
      },

      isOldDynamoFct : function ()
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
        if ($("link[href='" + this.dynAdminCssUri + "']").size() === 0)
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

      hasWebStorageFct : function ()
      {
        if(typeof(Storage) !== "undefined")
          return true;
        return false;
      },

      isXMLDefinitionFilePageFct : function()
      {
        return $("td:contains('class atg.xml.XMLFile')").size() > 0
        || $("td:contains('class [Latg.xml.XMLFile;')").size() > 0;
      },

      isServiceConfigurationPageFct : function()
      {
        return location.search.indexOf("propertyName=serviceConfiguration") != -1;
      },

      isComponentPageFct : function ()
      {
        return $("h1:contains('Directory Listing')").size() === 0 //Page is not a directory
        && document.URL.indexOf('/dyn/admin/nucleus/') != -1 // Page is in nucleus browser
        && document.URL.indexOf("?") == -1; // Page has no parameter
      },

      isActorChainPageFct : function()
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
          var $codeBlock = $(this)
          // remove previous XML content
          .empty()
          // add code tags
          .append("<code class='xml'></code>")
          .find("code")
          // set escape XML content, because highlight.js needs escape XML to works
          .text(unescapeXML);

          // Run highlight.js on each XML block
          console.log($codeBlock.get(0));
          hljs.highlightBlock($codeBlock.get(0));
          // Make component path clickable
          $codeBlock.find("span.hljs-attribute:contains('jndi'), span.hljs-attribute:contains('repository')")
          .each(function() {
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

      setupPageTitle : function()
      {
        $("title").text(this.getComponentNameFromPath(this.getCurrentComponentPath()));
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
         if(!this.hasWebStorage)
          return {};
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
        if(this.hasWebStorage)
        {
          console.log("Try to store config: " + name + ", value : " + JSON.stringify(value));
          var storedConfig = this.getStoredConfiguration();
          storedConfig[name] = value;
          BDA.storeItem(this.STORED_CONFIG, JSON.stringify(storedConfig));
        }
      },

      // -- TAGS management function

      buildArray : function(stringIn)
      {
        var cleaned = stringIn.replace(/[ \t]/g,'').replace(/,,+/g,',');
        var array;
        if (cleaned !== "")
          array = cleaned.split(',');
        else
          array = [];
        return array;
      },

      buildTagsFromArray : function(tagNames,defaultValue)
      {
         var value = defaultValue !== null ? defaultValue : false;
         var tags = {};
         for (var i = 0; i < tagNames.length; i++) {
          var tagName = tagNames[i];
          var tag = {};
          tag.selected = value;
          tag.name = tagName;
          tags[tagName] = tag;
        }
        console.log('buildTagsFromArray ' + JSON.stringify(tags));
        return tags;
      },

      buildTagsFromString : function(tagString,defaultValue)
      {
          var tagNames = BDA.unique(BDA.buildArray(tagString));
          return BDA.buildTagsFromArray(tagNames,defaultValue);
      },

      editTags : function(newTags)
      {
        console.log('editTags + ' + JSON.stringify(newTags));
         var existingTags = BDA.getTags();
         for (var name in existingTags)
         {
          if(newTags[name])
          {
            var oldTag = existingTags[name];
            newTags[name].selected = oldTag.selected;
          }
         }
        BDA.saveTags(newTags);
      },

      addTags : function(newTags)
      {
        console.log('add tags:');
        var existingTags = BDA.getTags();
        console.log('existingTags = ' + JSON.stringify(existingTags));
        for (var name in newTags)
        {
          console.log('name : ' + name);
          var newTag = newTags[name];
          console.log('newTag = ' + JSON.stringify(newTag));
          if(existingTags[newTag.name] === null || existingTags[newTag.name] === undefined){
            existingTags[newTag.name] = newTag;
          }
        }
        console.log('existingTags = ' + JSON.stringify(existingTags));
        BDA.saveTags(existingTags);
      },

      getTags : function()
      {
          var tags = BDA.getConfigurationValue('tags');
          if(tags === null || tags === undefined)
            tags = {};
          return tags;
      },

      saveTags : function(tags)
      {
        BDA.storeConfiguration('tags', tags);
      },

      clearTags : function()
      {
          console.log('clearTags');
          var savedtags = BDA.getTags();
            for (var sTagName in savedtags)
            {
               var sTag = savedtags[sTagName];
               sTag.selected = false;
            }

          console.log('savedtags = ' + JSON.stringify(savedtags));
          BDA.saveTags(savedtags);
          BDA.reloadToolbar();
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
          BDA.storeItem('componentHistory', JSON.stringify(componentHistory));
        }
      },

      showComponentHsitory : function ()
      {
        $("<div id='history'></div>").insertAfter(this.logoSelector);
        var componentHistory =  JSON.parse(localStorage.getItem('componentHistory')) || [];
        var html = "Component history : ";
        for (var i = 0; i != componentHistory.length; i++)
        {
          if (i !== 0)
            html += ", ";
          var comp = componentHistory[i];
          html += "<a href='" + comp + "'>" + this.getComponentNameFromPath(comp) + "</a>";
        }
        $("#history").html(html);
      },



      getData : function()
      {
        console.log("Getting all data from localstorage");
        var dataObj = {};
        dataObj.components = BDA.getStoredComponents();
        dataObj.queries = BDA.getStoredRQLQueries();
        dataObj.configuration = BDA.getStoredConfiguration();
        return dataObj;
      },

      reloadData : function()
      {
        this.reloadToolbar();
        if (this.isRepositoryPage)
          this.reloadQueryList();
      },

      restoreData : function (data, reloadUI)
      {
        if(this.hasWebStorage && data !== undefined)
        {
          try
          {
            var dataObj = JSON.parse(data);
            BDA.storeItem('Components', JSON.stringify(dataObj.components));
            BDA.storeItem('RQLQueries', JSON.stringify(dataObj.queries));
            BDA.storeItem(this.STORED_CONFIG, JSON.stringify(dataObj.configuration));
            if (reloadUI)
              this.reloadData();
          }
          catch (e) {
            console.error("Parsing error:", e);
          }
        }
      },

      copyToClipboard : function (text)
      {
        GM_setClipboard(text);
        window.alert("Data have been added to your clipboard");
      },

      // advanced config
      createDefaultMethodsConfig : function(parentPanel)
      {
        var $config = $('<div id="advancedConfig"></div>');
        $config.appendTo(parentPanel);
        // Default methods
        var savedMethods = this.getConfigurationValue('default_methods');
        if(!savedMethods){
          savedMethods = "";
        }

         $config.append(
          "<p>Default methods when bookmarking components:</p>"
          + "<textarea id='config-methods-data' class='' placeholder='List of methods names, comma separated'>"+savedMethods+"</textarea>"
          );

         var $submitMethods = $('<button id="config-methods-submit">Save</button>')
          .bind('click',function(){
              var methods=$('#config-methods-data').val().trim();
              var methodsArray=methods.replace(/ /g,'').split(",");
              console.log('storing methods : ' + methodsArray);
              BDA.storeConfiguration("default_methods",methodsArray);
            }
         );
         $config.append($submitMethods);

        // Default properties
        var savedProperties = this.getConfigurationValue('default_properties');
        if(!savedProperties){
          savedProperties = "";
        }

        $config.append(
          "<p>Default properties when bookmarking components:</p>"
          + "<textarea id='config-properties-data' class='' placeholder='List of properties, comma separated'>"+savedProperties+"</textarea>"
          );

        var $submitProperties  = $('<button id="config-properties-submit">Save</button>')
          .bind('click', function(){
              var properties=$('#config-properties-data').val().trim();
              var propertiesArray=properties.replace(/ /g,'').split(",");
              console.log('storing properties : ' + propertiesArray);
              BDA.storeConfiguration("default_properties",propertiesArray);
            }
          );
        $config.append($submitProperties);

        var savedTags = this.getTags();
        var tagAsString = "";
        var index = 0;
        var tagsSize = Object.keys(savedTags).length;
        for (var key in savedTags) {
          tagAsString += key;
          if(index < tagsSize){
            tagAsString += ',';
          }
          index++;
        }
         $config.append(
          "<p>Edit tags:</p>"
          + "<textarea id='config-tags-data' class='' placeholder='List of tags, comma separated'>"+tagAsString+"</textarea>"
          );

         var $submitTags = $('<button id="config-tags-submit">Save</button>')
          .bind('click', function(){
              var tagString = $('#config-tags-data').val();
              var tags = BDA.buildTagsFromString(tagString, false);
              console.log('storing tags : ' + JSON.stringify(tags));
              BDA.editTags(tags);
              BDA.reloadToolbar();
            }
          );
        $config.append($submitTags);

      },

      //--- Toolbar functions ------------------------------------------------------------------------

      getStoredComponents : function ()
      {
        if(!this.hasWebStorage)
          return [];
        var storedComp;
        var storedCompStr = localStorage.getItem('Components');
        if (storedCompStr)
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
        BDA.storeItem('Components', JSON.stringify(storedComponents));
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
        BDA.storeItem('Components', JSON.stringify(components));
        this.reloadToolbar();
      },

      storeComponent : function (component, methods, vars,tags)
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

          compObj.methods = methods;
          compObj.vars = vars;
          compObj.tags =tags;
          storedComp.push(compObj);

          BDA.storeItem('Components', JSON.stringify(storedComp));
          var tagMap = BDA.buildTagsFromArray(tags,false);
          BDA.addTags(tagMap);

        }
      },

      storeItem : function(itemName, itemValue)
      {
        //console.log("Storing item : " + itemName + " : " + itemValue);
        localStorage.setItem(itemName, itemValue);
        if(GM_getValue(BDA.GMValue_MonoInstance) === true)
          GM_setValue(BDA.GMValue_Backup, JSON.stringify(BDA.getData()));
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
          if (i !== 0)
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
        for (i = 0; i < 3; i++) {
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
        $('#toolbarContainer').remove();
        $('#addComponentToolbarPopup').remove();
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
        console.log("createToolbar");
        //get existing tags
        $("<div id='addComponentToolbarPopup' class='popup_block'>"
          + "<div class='addFavOptions'>"
            + "<a href='#' class='close'><i class='fa fa-times'></i></a>"
            + "<h3 class='popup_title'>Add new component</h3>"
            + "<p>Choose methods and/or properties to shortcut : </p>"
            + "<div id='addComponentToolbarPopupContent'>"
              + "<div id='methods'><ul></ul></div>"
              + "<div id='vars'><ul></ul></div>"
            + "</div><br>"
            + "<div id='favSetTags'>"
              + "<div class='favline'>"
                + "<div>Add tags:</div>"
                + "<div><ul id='existingTags'></ul></div>"
              + "</div>"
              + "<div class='favline'>"
              + "<div>New tags:</div>"
               + "<div><input id='newtags' class='newtags' type='text' placeholder='comma separated'></input></div>"
             + "</div>"
            + "</div>"
            + "<div class='addFavSubmit'>"
              + "<button type='button' id='submitComponent'>Add <i class='fa fa-play fa-x'></button>"
            + "</div>"
          + "</div>"
        + "</div>").insertAfter(this.logoSelector);

        BDA.addExistingTagsToToolbarPopup();

        var favs = this.getStoredComponents();

        $("<div id='toolbarContainer'></div>").insertAfter(this.logoSelector);
        $("<div id='toolbar'></div>").appendTo("#toolbarContainer");

        var tags = BDA.getTags();
        var selectedTags = [];
        for(var tagName in tags){
          var tag = tags[tagName];
          if(tag.selected){
            selectedTags.push(tagName);
          }
        }

        for(var i = 0; i != favs.length; i++)
        {
          var fav = favs[i];
          var show = false;

          var componentTags = fav.tags;
          if(selectedTags !== null && selectedTags.length > 0){
            //check if any tag is selected
            this.logTrace(fav.componentName + ' = ' + componentTags);
            if(componentTags !== null && componentTags !== undefined){
              for (var j = 0; j < componentTags.length; j++) {
                var cTag = componentTags[j];
                if($.inArray(cTag,selectedTags) > -1){
                  show = true;
                }
              }
            }

          }
          else
            show = true;

          //check filters

          if(show){
            var colors = this.stringToColour(fav.componentName);
            var shortName = this.getComponentShortName(fav.componentName);
            var callableHTML = "<div class='favMethods'>";
            if(fav.methods !== undefined)
            fav.methods.forEach(function(element) {
                callableHTML += "<a target='_blank' href='" + fav.componentPath + "?shouldInvokeMethod=" + element + "'>Call " + element + "</a><br>";
              });
            callableHTML += "</div><div class='favVars'>";
            if(fav.vars !== undefined)
            fav.vars.forEach(function(element) {
                callableHTML += "<a target='_blank' href='" + fav.componentPath + "?propertyName=" + element + "'>Change " + element + "</a><br>";
              });
            callableHTML += "</div>";

            var favTags = '';

            if(componentTags !== null && componentTags !== undefined){
              for (var k = 0; k < componentTags.length; k++) {
                var t = componentTags[k];
                favTags+='#'+t;
                if(k+1 < componentTags.length){
                  favTags+=',';
                }
              }
            }

            $("<div class='toolbar-elem fav'></div>")
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
                + callableHTML
                + "<div class='favDelete' id='delete" + fav.componentName + "'><i class='fa fa-trash-o'></i> Delete</div>"
                + '<div class="fav-tags">'+ favTags + '</div>'
                + "</div>")
                .appendTo("#toolbar");
          }
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
            console.log('adding fav button');
            $("<div class='toolbar-elem newFav'><a href='javascript:void(0)' id='addComponent' title='Add component to toolbar'>+</a></div>")
            .appendTo("#toolbar");

              $('.close').click(function() {
                  $('.popup_block').fadeOut();
              });

              $('#submitComponent').click(function(){
                  $('.popup_block').fadeOut();
                  var methods = [];
                  var vars = [];
                  $('.method:checked').each(function(index, element){
                      methods.push(element.parentElement.textContent);
                  });
                  $('.variable:checked').each(function(index, element){
                      vars.push(element.parentElement.textContent);
                  });
                  // filter out empty values
                  var tags = BDA.buildArray($('#newtags').val());
                  //add selected tags
                  $('.tag:checked').each(function(index, element){
                      tags.push(element.parentElement.textContent);
                  });
                  //remove dupes
                  tags=BDA.unique(tags);

                  console.log("methods : " + methods);
                  console.log("vars : " + vars);
                  console.log("tags : " + tags);
                  BDA.storeComponent(componentPath, methods, vars,tags);
                  BDA.reloadToolbar();
              });

            $(".newFav").click(function() {
              console.log("Add component");
              var methodsList = $("#methods");
              var varsList = $("#vars");
              var tagList = $("#tags");
              methodsList.empty();
              varsList.empty();

              var tableMethods = $('h1:contains("Methods")').next();
              tableMethods.find('tr').each(function(index, element) {
                if (index > 0)
                {
                   var linkMethod = $(element).find('a').first();
                   var methodName = $(linkMethod).attr("href").split('=')[1];
                   methodsList.append('<li><input type="checkbox" class="method" id="method_' + methodName + '"><label for="method_' + methodName + '">' + methodName + '</label></li>');
                }
              });

              //handle default methods
              var defMethods = BDA.getConfigurationValue('default_methods');
              console.log('savedMethods: ' + defMethods);
              if (defMethods)
              {
                  defMethods.forEach(function(methodName){
                  console.log('setting default method: ' + methodName);
                  $('#method_'+methodName).attr('checked',true);
                });
              }

              var tablevars = $('h1:contains("Properties")').next();
              tablevars.find('tr').each(function(index, element){
                if (index > 0)
                {
                  var linkVariable =  $(element).find('a').first();
                  var variableName = $(linkVariable).attr("href").split('=')[1];
                  varsList.append('<li><input type="checkbox" class="variable" id="var_' + variableName + '"><label for="var_' + variableName + '">' + variableName + '</label></li>');
                }
              });

              var defProperties = BDA.getConfigurationValue('default_properties');
              console.log('savedProperties: ' + defProperties);
              if(defProperties)
              {
                defProperties.forEach(function(name){
                  console.log('setting default properties: ' + name);
                  $('#var_'+name).attr('checked',true);
                });
              }

              $('#addComponentToolbarPopup').fadeIn();
            });
          }
        }

         BDA.addFavTagList();
      },

      addExistingTagsToToolbarPopup : function()
      {
          //add tags to the addFav popup
        var tags = this.getTags();
        var $tagList = $('#existingTags');

        var sortedTags = [];
        for (var tagName in tags) {
          sortedTags.push(tagName);
        }
        sortedTags = BDA.sort(sortedTags);

        for (var i = 0; i < sortedTags.length; i++) {
          var tagValue = sortedTags[i];
          $('<label>' + tagValue + '</label>')
          .attr('for','tagSelector_'+tagValue)
          .insertAfter(
            $('<input/>',{
              id:'tagSelector_'+tagValue,
              type:'checkbox',
              name:tagValue,
              class:'tag'
            })
           .appendTo(
             $('<li></li>').appendTo($tagList)
           )
          );
        }
      },

      addFavFilter :function()
      {
        var tags = this.getTags();
        if(tags !== null && Object.keys(tags).length> 0){
          $("<div class='toolbar-elem favFilter'><a href='javascript:void(0)' id='favFilter' title='Filter'><i class='fa fa-chevron-down fav-chevron'></i></a></div>")
            .on('click',function () {
                var open = BDA.getConfigurationValue('filterOpen');
                if(open === null || open === undefined || !open){
                  open = false;
                }
                BDA.storeConfiguration('filterOpen',!open);

                $('#favTagList').toggle(50);
            })
            .appendTo("#toolbar");
        }
      },

      addFavTagList : function()
      {
        console.log('addfavTagList');
        var tags = this.getTags();

        var $favline = $('<div id="favTagList" class="favline">').appendTo('#toolbar');

        var $list = $('<ul></ul>');

        //if at least one filter
        if(tags !== null && Object.keys(tags).length> 0){
          $('<button id="clear-filters" class="bda-button bda-button-icon" title="Clear"><i class="fa fa-times" aria-hidden="true"></i></button>')
           .on('click',this.clearTags)
           .appendTo(
              $('<li class="tag-filter" ></li>')
             .appendTo($list)
           );
        }

        var sortedTags = [];
        for (var tagName in tags) {
          sortedTags.push(tagName);
        }
        sortedTags = BDA.sort(sortedTags);

        for (var i = 0; i < sortedTags.length; i++) {
          tagName = sortedTags[i];
          var tag = tags[tagName];
          var tagColor = this.stringToColour(tagName);

          $('<label >#' + tagName + '</label>')
          .attr('for','favFilter_'+tagName)
          .insertAfter(
            $('<input/>',{
              id:'favFilter_'+tagName,
              type:'checkbox',
              name:tagName,
              class:'favFilterTag',
              checked: tag.selected
            }
           )
           .on('change', function() {
              var name = $(this).attr('name');
              console.log('applyFavFilter : '+ name);
              var tags = BDA.getTags();
              var tag = tags[name];
              if(tag !== null)
                tag.selected=$(this).prop('checked');
              BDA.saveTags(tags);
              BDA.reloadToolbar();
           })
           .appendTo(
             $('<li class="bda-button tag-filter" ></li>')
             .css("background-color", this.colorToCss(tagColor))
             .css("border", "1px solid " + this.getBorderColor(tagColor))
             .appendTo($list)
           )
          );

        }
        $list.appendTo($favline);
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
        var actorChainIdValue = $("h2:contains('Actor Chain:')").text().replace("Actor Chain: ", "");

        var inputsHeader = tableActorHeaderColumns.filter(function(index, element){
          return $(element).text() === "Inputs";
        });
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
        for(var input in inputs)
        {
            inputsHTML += inputs[input] + " <textarea name='" + inputs[input] + "'></textarea><br />";
        }
        var url = window.location.origin + '/rest/model' + componentPathName + actorChainIdValue;
        console.log(url);
        var actorChainCallHtml = "<div id='actorChainCall' border>"
            + "<h2>Call actor</h2>"
            + "<a href='javascript:void(0)' id='copyChainUrl'>Copy URL to clipboard</a>";
            if (inputs.length > 0)
              actorChainCallHtml += "<br />Post parameters are " + inputs + "<br />";
            actorChainCallHtml += "<form method='POST' action='/rest/model" + componentPathName + actorChainIdValue + "'>"
            + inputsHTML
            + "<button type='submit'>Call <i class='fa fa-play fa-x'></button>"
            + "</form></div>";

        tableActor.after(actorChainCallHtml);
        $("#copyChainUrl").click(function(){
          BDA.copyToClipboard(url);
        });
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
              if (strValue !== null && strValue != "DataSourceInfoCache" && strValue.indexOf("DataSource") != -1)
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

      getXmlDef : function(componentPath)
      {
        console.log("Getting XML def for : " + componentPath);
        var timestamp =  Math.floor(Date.now() / 1000);
        var xmlDefMetaData = JSON.parse(localStorage.getItem("XMLDefMetaData"));
        if (!xmlDefMetaData)
          return null;
        if (xmlDefMetaData.componentPath != componentPath || (xmlDefMetaData.timestamp + BDA.xmlDefinitionCacheTimeout) < timestamp)
        {
          console.log("Xml def is outdated or from a different repo");
          return null;
        }
        return localStorage.getItem("XMLDefData");
      },


      processRepositoryXmlDef : function(property, callback)
      {
        if(callback !== undefined)
        {
          // First check cache value if any
          var rawXmlDef = BDA.getXmlDef(BDA.getCurrentComponentPath());
          if (rawXmlDef !== null)
          {
            console.log("Getting XML def from cache");
            var xmlDoc = jQuery.parseXML(rawXmlDef);
            if(callback !== undefined)
                callback($(xmlDoc));
          }
          // If no cache entry, fetch the XML def in ajax
          else
           {
            var url = location.protocol + '//' + location.host + location.pathname + "?propertyName=" + property;
            console.log(url);
            jQuery.ajax({
              url:     url,
              success: function(result) {
                var $result = $(result);
                if ($result.find("pre").size() > 0)
                {
                  rawXmlDef = $result.find("pre")
                  .html()
                  .trim()
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace("&nbsp;", "")
                  .replace("<!DOCTYPE gsa-template SYSTEM \"dynamosystemresource:/atg/dtds/gsa/gsa_1.0.dtd\">", "");
                    try
                    {
                        console.log("XML def length : " + rawXmlDef.length);
                        var xmlDoc = jQuery.parseXML(rawXmlDef);
                        BDA.storeXmlDef(BDA.getCurrentComponentPath(), rawXmlDef);
                        callback($(xmlDoc));
                    }
                    catch(err)
                    {
                        console.log("Unable to parse XML def file !");
                        callback(null);
                        console.log(err);
                    }
                }
                else
                  callback(null);
              },
            });
          }
        }
      },

      //UTILS

      logTrace : function (msg)
      {
        if(this.isLoggingTrace){
          console.log(msg);
        }
      },

      unique : function (array)
      {
        var n = {},r=[];
        for(var i = 0; i < array.length; i++)
        {
          if (!n[array[i]])
          {
            n[array[i]] = true;
            r.push(array[i]);
          }
        }
        return r;
      },

      sort : function (array)
      {
        BDA.logTrace('beforeSort : ' + array);
        var sorted = array.sort(function(a,b) {
          if(a !== null)
            return a.localeCompare(b, 'en', { caseFirst: 'upper' });
          else if( b !== null)
            return -1;
          else
            return 0;
        });
        BDA.logTrace('after sort : ' + sorted);
        return sorted;
      }

    }; // end of BDA

    // INIT BDA
    if (document.getElementById("oracleATGbrand") !== null || BDA.isOldDynamoFct())
    {
      console.log("Loading BDA");
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
  })(jQuery);
});
