(function($) {
  console.log("bda.repository.js started");
//  "use strict";
  var BDA_REPOSITORY = {
    MAP_SEPARATOR : "=",
    LIST_SEPARATOR : ",",
    descriptorTableSelector : "table:eq(0)",
    repositoryViewSelector : "h2:contains('Examine the Repository, Control Debugging')",
    cacheUsageSelector : "h2:contains('Cache usage statistics')",
    propertiesSelector : "h1:contains('Properties')",
    eventSetsSelector : "h1:contains('Event Sets')",
    methodsSelector : "h1:contains('Methods')",
    resultsSelector : "h2:contains('Results:')",
    errorsSelector1 : "p:contains('Errors:')",
    errorsSelector2 : "code:contains('*** Query:')",
    defaultItemByTab : "10",
    nbItemReceived : 0,
    itemTree : new Map(),
    startGettingTree : 0,
    defaultDescriptor : {
                          "OrderRepository"          : "order",
                          "CsrRepository"            : "returnRequest",
                          "ProfileAdapterRepository" : "user",
                          "ProductCatalog"           : "sku",
                          "InventoryRepository"      : "inventory",
                          "PriceLists"               : "price"
    },
    xmlDefinitionMaxSize : 150000, // 150 Ko
    queryEditor : null,
    descriptorList : null,
    isRepositoryPage : false,
    hasErrors : false,
    hasResults : false,
    templates : {
      printItem : '<print-item item-descriptor="{0}" id="{1}"/>',
      queryItems : '<query-items item-descriptor="{0}">{1}</query-items>'
    },

    build : function()
    {
      BDA_REPOSITORY.isRepositoryPage = BDA_REPOSITORY.isRepositoryPageFct();
      BDA_REPOSITORY.hasErrors = BDA_REPOSITORY.hasErrorsFct();
      BDA_REPOSITORY.hasResults = BDA_REPOSITORY.hasResultsFct(BDA_REPOSITORY.hasErrors);
      console.log("isRepositoryPage : " + BDA_REPOSITORY.isRepositoryPage + " Page has results : " + BDA_REPOSITORY.hasResults + ". Page has errors : " + BDA_REPOSITORY.hasErrors);
      // Setup repository page
      if (BDA_REPOSITORY.isRepositoryPage)
        BDA_REPOSITORY.setupRepositoryPage();
    },

    isRepositoryPageFct : function ()
    {
      return $("h2:contains('Run XML Operation Tags on the Repository')").length > 0;
    },

    setupRepositoryPage : function ()
    {
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

      $(BDA_REPOSITORY.descriptorTableSelector).attr("id", "descriptorTable");

      $("<div id='RQLEditor'></div>").insertBefore("h2:first");
      $("<div id='RQLResults'></div>").insertBefore("#RQLEditor");
      if (BDA_REPOSITORY.hasErrors)
        BDA_REPOSITORY.showRqlErrors();
      if (BDA_REPOSITORY.hasResults && !BDA_REPOSITORY.hasErrors)
        BDA_REPOSITORY.showRQLResults();

      $("form:eq(1)").appendTo("#RQLEditor");
      $("form:eq(1)").attr("id", "RQLForm");
      var $children = $("#RQLForm").children();
      $("#RQLForm").empty().append($children);
      $("textarea[name=xmltext]").attr("id", "xmltext");
      $("<div id='RQLToolbar'></div>").insertBefore("#RQLEditor textarea");

      $("#RQLToolbar").append("<div> Action : "+ actionSelect
          + " <span id='editor'>"
          + "<span id='itemIdField' >ids : <input type='text' id='itemId' placeholder='Id1,Id2,Id3' /></span>"
          + "<span id='itemDescriptorField' > descriptor :  <select id='itemDescriptor' class='itemDescriptor' >" + BDA_REPOSITORY.getDescriptorOptions() + "</select></span>"
          + "<span id='idOnlyField' style='display: none;'><label for='idOnly'>&nbsp;id only : </label><input type='checkbox' id='idOnly'></input></span>"
          + "</span>"
          + BDA_REPOSITORY.getsubmitButton() + "</div>");


      $("#RQLAction").select2({
        width : "style",
        minimumResultsForSearch: -1
      });

      $("#RQLToolbar").after("<div id='RQLText'></div>");
      $("#xmltext").appendTo("#RQLText");
      $("#RQLText").after("<div id='storedQueries'></div>");
      $("#RQLText").after("<div id='descProperties'></div>");
      $("#RQLForm input[type=submit]").remove();

      var splitObj = BDA_STORAGE.getStoredSplitObj();
      var itemByTab = BDA_REPOSITORY.defaultItemByTab;
      var isChecked = false;
      if (splitObj)
      {
        itemByTab = splitObj.splitValue;
        isChecked = splitObj.activeSplit;
      }
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

      BDA_REPOSITORY.showQueryList();
      BDA_REPOSITORY.queryEditor = CodeMirror.fromTextArea(document.getElementById("xmltext"), {lineNumbers: false});
      BDA_REPOSITORY.setupItemTreeForm();
      BDA_REPOSITORY.setupItemDescriptorTable();
      BDA_REPOSITORY.setupPropertiesTables();

      $(".itemDescriptor").select2({
        placeholder: "Select a descriptor",
        allowClear: false,
        width : "element",
        matcher: function (params, data) {
          // If there are no search terms, return all of the data
          if ($.trim(params) === '') {
            return data;
          }
          data = data.toUpperCase();
          params = params.toUpperCase();
          // `params.term` should be the term that is used for searching
          // `data.text` is the text that is displayed for the data object
          if(data.indexOf(params) != -1)
              return true;
          return false;
        }
      });
      $("#itemDescriptor").on("select2-selecting", function(e){
        BDA_REPOSITORY.showItemPropertyList(e.val);
      });
      var defaultDescriptor = BDA_REPOSITORY.defaultDescriptor[getComponentNameFromPath(getCurrentComponentPath())];
      if(defaultDescriptor !== undefined)
        BDA_REPOSITORY.showItemPropertyList(defaultDescriptor);

      $("#RQLAction").change(function() {
        var action = $(this).val();
        console.log("Action change : " + action);
        if (action == "print-item")
          BDA_REPOSITORY.getPrintItemEditor();
        else if (action == "query-items")
          BDA_REPOSITORY.getQueryItemsEditor();
        else if (action == "remove-item")
          BDA_REPOSITORY.getRemoveItemEditor();
        else if (action == "add-item")
          BDA_REPOSITORY.getAddItemEditor();
        else if (action == "update-item")
          BDA_REPOSITORY.getUpdateItemEditor();
        else
          BDA_REPOSITORY.getQueryItemsEditor();
      });

      $("#RQLSubmit").click(function() {
        BDA_REPOSITORY.submitRQLQuery(false);
      });

      $("#RQLGo").click(function() {
        BDA_REPOSITORY.submitRQLQuery(true);
      });

      $("#RQLAdd").click(function() {
          var query = BDA_REPOSITORY.getRQLQuery();
          BDA_REPOSITORY.addToQueryEditor(query);
      });

      $("#saveQuery").click(function() {
        if (BDA_REPOSITORY.getQueryEditorValue().trim().length > 0 && $("#queryLabel").val().trim().length > 0)
        {
          BDA_STORAGE.storeRQLQuery($("#queryLabel").val().trim(), BDA_REPOSITORY.getQueryEditorValue().trim());
          BDA_REPOSITORY.showQueryList();
        }
      });

      $("#clearQuery").click(function() {
        BDA_REPOSITORY.setQueryEditorValue("");
      });

      // Hide other sections
      var toggleObj = BDA_STORAGE.getToggleObj();

      var repositoryView  = "<a href='javascript:void(0)' id='showMoreRepositoryView' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreRepositoryView) + "</a>";
      var cacheUsage  = "&nbsp;<a href='javascript:void(0)' id='showMoreCacheUsage' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreCacheUsage) + "</a>";
      var properties  = "&nbsp;<a href='javascript:void(0)' id='showMoreProperties' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreProperties) + "</a>";
      var eventSets  = "&nbsp;<a href='javascript:void(0)' id='showMoreEventsSets' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreEventsSets) + "</a>";
      var methods  = "&nbsp;<a href='javascript:void(0)' id='showMoreMethods' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreMethods) + "</a>";

      // Auto hide Repository View
      $(BDA_REPOSITORY.repositoryViewSelector).append(repositoryView);

      if (toggleObj.hasOwnProperty("showMoreRepositoryView") && toggleObj.showMoreRepositoryView == 0)
        BDA_REPOSITORY.toggleRepositoryView();
      $("#showMoreRepositoryView").click(function (){
        BDA_REPOSITORY.toggleRepositoryView();
      });
      // Auto hide Cache usage
      $(BDA_REPOSITORY.cacheUsageSelector).append(cacheUsage);
      if (toggleObj.showMoreCacheUsage != 1)
        BDA_REPOSITORY.toggleCacheUsage();
      $("#showMoreCacheUsage").click(function (){
        BDA_REPOSITORY.toggleCacheUsage();
      });
      // Auto hide Properties
      $(BDA_REPOSITORY.propertiesSelector).append(properties);
      if (toggleObj.showMoreProperties != 1)
        BDA_REPOSITORY.toggleProperties();
      $("#showMoreProperties").click(function (){
        BDA_REPOSITORY.toggleProperties();
      });
      // Auto hide Events Sets
      $(BDA_REPOSITORY.eventSetsSelector).append(eventSets);
      if (toggleObj.showMoreEventsSets != 1)
        BDA_REPOSITORY.toggleEventSets();
      $("#showMoreEventsSets").click(function (){
        BDA_REPOSITORY.toggleEventSets();
      });
      // Auto hide Methods
      $(BDA_REPOSITORY.methodsSelector).append(methods);
      if (toggleObj.showMoreMethods != 1)
        BDA_REPOSITORY.toggleMethods();
      $("#showMoreMethods").click(function (){
        BDA_REPOSITORY.toggleMethods();
      });

      $('body').on('click', '.dataTable .fa-pencil-square-o', function(item)
      {
        var $target = $(item.target).parent();
        $target.html('<input type="text" value="' + $target.text().replace('●', ' ') + '"/>');
        var $input = $($target.children()[0]);
        $input.focus().blur(function(item)
        {
            if(confirm('do you really want to update that value ?'))
            {
              var $target = $(item.target);
              var $table = $target.parents(".dataTable");
              var column = $target.parent().parent().children().index($target.parent());
              var line = $table.find("tbody > tr").index($target.parent().parent());
              var columnId = $table.find(".id").index();
              var columnDescriptor = $table.find(".descriptor").index();
              var itemId = jQuery($table.find("tbody > tr:eq(" + columnId + ")").find("> *")[column]).text();
              var descriptor = jQuery($table.find("tbody > tr:eq(" + columnDescriptor + ")").find("> *")[column]).text();
              var propertyName = jQuery($table.find("tbody > tr > *:first-child")[line]).text();
              if(propertyName == "id" || propertyName == "descriptor")
              {
                $input.parent().html($input.val());
                $.notify(
                    "You can't change value of id or descriptor this way.",
                    { position:"top center",
                     className:"error"}
                );
              }
              else
              {
                console.log(itemId + " " + descriptor + " " + $target.val() + " " + propertyName);
                jQuery.post(document.location.href, 'xmltext=<update-item id="' + itemId + '" item-descriptor="' + descriptor + '"><set-property name="' + propertyName + '"><![CDATA[' + $target.val() + ']]></set-property></update-item>', function(){
                  $.notify(
                      "value changed",
                      { position:"top center",
                       className:"success"}
                  );
                  $input.parent().html('<i class="fa fa-pencil-square-o" aria-hidden="true"></i>' + $input.val());
                });
              }
            }
            else
              $input.parent().html('<i class="fa fa-pencil-square-o" aria-hidden="true"></i>' + $input.val());
        });
      });
    },

    addToQueryEditor:function(query)
    {
      var editor = BDA_REPOSITORY.queryEditor;
      var editorCursor = editor.getCursor();
      if(editorCursor.ch !==  0)
        editor.setCursor(editor.getCursor().line + 1, 0);

      BDA_REPOSITORY.queryEditor.replaceSelection(query);
    },

    setupPropertiesTables : function()
    {
      if ($("a[name=showProperties]").length > 0)
      {
        $("a[name=showProperties]").next().attr("id", "propertiesTable");
        $("#propertiesTable").find("tr:nth-child(odd)").addClass("odd");
      }
    },

    setupItemDescriptorTable : function ()
    {
      var descriptors = BDA_REPOSITORY.getDescriptorList();
      var componentURI = window.location.pathname;
      var splitValue = 20;
      var html = "<p>" + descriptors.length + " descriptors available.</p>";
      html += "<div>";
      for (var i = 0; i != descriptors.length; i++)
      {
        if (i === 0 || i % splitValue === 0)
        {
          html += "<table class='descriptorTable'>";
          html += "<th>Descriptor</th>";
          html += "<th>View</th>";
          html += "<th>Debug</th>";
        }
        if (i % 2 === 0)
          html += "<tr class='even'>";
        else
          html += "<tr class='odd'>";
        var isDebugEnable = false;
        if ($("a[href='" + componentURI + "?action=clriddbg&itemdesc=" + descriptors[i] + "#listItemDescriptors']").length > 0)
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
        if (i !== 0 && ((i + 1) % splitValue === 0 || i + 1 === descriptors.length))
          html += "</table>";
      }
      html += "</div>";
      html += "<div style='clear:both' />";

      $("#descriptorTable").remove();
      $(html).insertAfter("a[name='listItemDescriptors']");
    },


    showItemPropertyList : function(item)
    {
      console.log("showItemPropertyList");
      var componentURI = window.location.pathname;
      var url = componentURI + "?action=seetmpl&itemdesc=" + item + "#showProperties";
      $.get(url, function(data) {
        var $pTable = $(data).find("a[name='showProperties']").next();
        $pTable.find('th:nth-child(2), td:nth-child(2),th:nth-child(4), td:nth-child(4),th:nth-child(5), td:nth-child(5),th:nth-child(6), td:nth-child(6)').remove();
        $pTable.find('tr > td:first-child').append('<input type="button" class="itemPropertyBtn" value="set-prop"></input>');
        $("#storedQueries").css("display", "none");
        var $scrollDiv = $("<div class='scrollableTab'></div>").append($pTable);
        $("#descProperties")
        .empty()
        .append($scrollDiv)
        .append("<p class='showQueriesLabel'><a href='javascript:void(0)' id='showStoredQueries'>Show stored queries</a></p>")
        .css("display", "inline-block");

        $('.itemPropertyBtn').click(function(item){
          var $property = $($(item.target).parent());
          var regExp = /\(([^)]+)\)/;
          var matches = regExp.exec($property.text());
          if (matches !== undefined && matches.length === 2) {
              BDA_REPOSITORY.addToQueryEditor('<set-property name="' + matches[1] + '"><![CDATA[]]></set-property>\n');
          }
        });

        $("#showStoredQueries").click(function() {
          console.log("show stored queries");
          $("#descProperties").css("display", "none");
          $("#storedQueries").css("display", "inline-block");
        });

      });
    },

    hasResultsFct : function (hasErrors)
    {
      return $(BDA_REPOSITORY.resultsSelector).length > 0;
    },

    hasErrorsFct : function ()
    {
      return $(BDA_REPOSITORY.errorsSelector1).length > 0 || $(BDA_REPOSITORY.errorsSelector2).length > 0;
    },


    getDescriptorList : function()
    {
      if (BDA_REPOSITORY.descriptorList)
        return BDA_REPOSITORY.descriptorList;
      var descriptors = [];
      $("#descriptorTable tr th:first-child:not([colspan])")
      .sort(function(a, b){
        return $(a).text().toLowerCase() > $(b).text().toLowerCase() ? 1 : -1;
      }).each(function() {

        descriptors.push($(this).html().trim());
      });
      BDA_REPOSITORY.descriptorList = descriptors;
      return descriptors;
    },

    getDescriptorOptions: function ()
    {
      var descriptorOptions = "";
      var descriptors = BDA_REPOSITORY.getDescriptorList();
      descriptorOptions = "";
      var defaultDesc = BDA_REPOSITORY.defaultDescriptor[getComponentNameFromPath(getCurrentComponentPath())];
      if (defaultDesc === undefined)
        descriptorOptions = "<option></option>";
      for (var i = 0; i != descriptors.length; i++)
      {
        descriptorOptions += "<option value='" + descriptors[i] + "'";
        if (defaultDesc === descriptors[i])
          descriptorOptions += "selected='selected'";
        descriptorOptions +=  ">" + descriptors[i] + "</option>\n";
      }
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
      $("#idOnlyField").hide();
    },

    getAddItemEditor: function()
    {
      $("#itemIdField").hide();
      $("#itemDescriptorField").show();
      $("#idOnlyField").hide();
    },

    getRemoveItemEditor : function ()
    {
      BDA_REPOSITORY.getPrintItemEditor();
    },

    getRemoveItemsEditor : function ()
    {
      BDA_REPOSITORY.getPrintItemEditor();
    },

    getUpdateItemEditor : function ()
    {
      BDA_REPOSITORY.getPrintItemEditor();
    },

    getQueryItemsEditor : function ()
    {
      $("#itemIdField").hide();
      $("#itemDescriptorField").show();
      $("#idOnlyField").show();
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
      var ids = BDA_REPOSITORY.getMultiId();
      var descriptor = $("#itemDescriptor").val();
      var query = "";
      for (var i = 0; i != ids.length; i++)
        query += "<print-item id=\"" + ids[i].trim() + "\" item-descriptor=\"" + descriptor + "\" />\n";
      return query;
    },

    getRemoveItemQuery : function ()
    {
      var ids = BDA_REPOSITORY.getMultiId();
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
      var ids = BDA_REPOSITORY.getMultiId();
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
      var idOnly = $("#idOnly").prop('checked');
      var query = "<query-items item-descriptor=\"" + descriptor + "\" id-only=\"" + idOnly + "\">\n\n";
      query += "</query-items>\n";
      return query;
    },

    getAllItemQuery : function ()
    {
      var descriptor = $("#itemDescriptor").val();
      var idOnly = $("#idOnly").prop('checked');
      var query = "<query-items item-descriptor=\"" + descriptor + "\" id-only=\"" + idOnly + "\">\n";
      query += "ALL\n";
        query += "</query-items>\n";
      return query;
    },

    getLast10ItemQuery : function ()
    {
      var descriptor = $("#itemDescriptor").val();
      var idOnly = $("#idOnly").prop('checked');
      var query = "<query-items item-descriptor=\"" + descriptor + "\" id-only=\"" + idOnly + "\">\n";
      query += "ALL ORDER BY ID DESC RANGE 0+10\n";
        query += "</query-items>\n";
      return query;
    },

    getRQLQuery : function ()
    {
      var query = "";
      var action = $("#RQLAction").val();
      console.log("getRQLQuery : " + action);
      if (action == "print-item")
        query = BDA_REPOSITORY.getPrintItemQuery();
      else if (action == "query-items")
        query = BDA_REPOSITORY.getQueryItemsQuery();
      else if (action == "remove-item")
        query = BDA_REPOSITORY.getRemoveItemQuery();
      else if (action == "add-item")
        query = BDA_REPOSITORY.getAddItemQuery();
      else if (action == "update-item")
        query = BDA_REPOSITORY.getUpdateItemQuery();
      else if (action == "all")
        query = BDA_REPOSITORY.getAllItemQuery();
      else if (action == "last_10")
        query = BDA_REPOSITORY.getLast10ItemQuery();
      return query;
    },

    submitRQLQuery : function (addText)
    {
      if(addText)
      {
        var query = BDA_REPOSITORY.getRQLQuery();
        BDA_REPOSITORY.setQueryEditorValue(BDA_REPOSITORY.getQueryEditorValue() + query);
      }
      BDA_REPOSITORY.sanitizeQuery();
      BDA_STORAGE.storeSplitValue();
      // set anchor to the result div
      location.hash = '#RQLResults';
      $("#RQLForm").submit();
    },

    sanitizeQuery : function()
    {
      var query = BDA_REPOSITORY.getQueryEditorValue();
      BDA_REPOSITORY.setQueryEditorValue(query.replace(/repository\=\".+\"/gi, ""));
    },

    setQueryEditorValue :function(value)
    {
      BDA_REPOSITORY.queryEditor.getDoc().setValue(value);
    },

    getQueryEditorValue : function()
    {
      return BDA_REPOSITORY.queryEditor.getDoc().getValue();
    },

    showTextField : function (baseId)
    {
      baseId = BDA_REPOSITORY.sanitizeSelector(baseId);
      $("#" + baseId).toggle();
      $("#text_" + baseId).toggle();
    },

    // Escape '.', ':' in a jquery selector
    sanitizeSelector : function( id )
    {
      return id.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
    },

    purgeXml : function (xmlContent)
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
    },

    sanitizeXml : function (xmlContent)
    {
      var start = new Date().getTime();

      var regexp = /<\!--(.*)(<set\-property.*><\!\[CDATA\[[\S\s]*?\]\]\><\/set\-property\>).*-->/ig;
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

    // Check if the given property contains id(s) with the given item descriptor
    // Return an item descriptor name if the property is an ID,
    // Return null if the property is not found,
    // Return "FOUND_NOT_ID" is the property is found but is not an ID
     isPropertyId : function(propertyName, $itemDesc)
     {
       var isId = null;
       var propertyFound = false;
       $itemDesc.find("property[name=" + propertyName + "]").each(function() {
         propertyFound = true;
         var $property = $(this);
         if ($property.attr("item-type") !== undefined && $property.attr("repository") === undefined)
          isId = $property.attr("item-type");
         else if  ($property.attr("component-item-type") !== undefined && $property.attr("repository") === undefined)
          isId = $property.attr("component-item-type");
       });
       if (propertyFound && isId === null)
        return "FOUND_NOT_ID";
       return isId;
     },
    // Check if the given property contains id(s) with the given repository definition
    // Only ID from the current repository are take in account
    // Return the item descriptor name if the type if an ID, null otherwise
    isTypeId : function(propertyName, itemDesc, $xmlDef)
    {
      var isId = null;
      if ($xmlDef !== null)
      {
          var $itemDesc = $xmlDef.find("item-descriptor[name='" + itemDesc + "']");
          // First check in current item desc
          isId = BDA_REPOSITORY.isPropertyId(propertyName, $itemDesc);
          // In case we found the property but it's not an ID, we don't want to seach in super-type
          if (isId == "FOUND_NOT_ID")
            return null;
          // In case we found the property and it's an ID
          if (isId !== null)
            return isId;
          // Now we check in each super-type item desc
          var superType = $itemDesc.attr("super-type");
          while(superType !== undefined && isId === null)
          {
            var $parentDesc = $xmlDef.find("item-descriptor[name='" + superType + "']");
            //console.log("Search in super type : " + $parentDesc.attr("name"));
            isId = BDA_REPOSITORY.isPropertyId(propertyName, $parentDesc);
            superType = $parentDesc.attr("super-type");
          }
          if (isId == "FOUND_NOT_ID")
            return null;
      }
      //console.log("Property : " + propertyName + " of item " + itemDesc + " is ID : " + isId);
      return isId;
    },

    // Parse the given repository ID into a tab, each index will contains an ID or a separator : "," or "="
    parseRepositoryId : function(id)
    {
      var idAsTab = [];
      var tab = [];
      // Case of simple ID
      if (id.indexOf(BDA_REPOSITORY.MAP_SEPARATOR) == -1 && id.indexOf(BDA_REPOSITORY.LIST_SEPARATOR) === -1)
        idAsTab.push(id);
      // Case of a list of ID
      else if (id.indexOf(BDA_REPOSITORY.MAP_SEPARATOR) == -1 && id.indexOf(BDA_REPOSITORY.LIST_SEPARATOR) !== -1)
      {
        tab = id.split(BDA_REPOSITORY.LIST_SEPARATOR);
        for(var i = 0 ; i != tab.length; i++)
        {
          if (i !== 0)
            idAsTab.push(BDA_REPOSITORY.LIST_SEPARATOR);
          idAsTab.push(tab[i]);
        }
      }
      // Case of a Map of ID
      else
      {
        var mapEntries = id.split(BDA_REPOSITORY.LIST_SEPARATOR);
        for(var a = 0 ; a != mapEntries.length; a++)
        {
          if (a !== 0)
            idAsTab.push(BDA_REPOSITORY.LIST_SEPARATOR);
          var mapValues = mapEntries[a].split(BDA_REPOSITORY.MAP_SEPARATOR);
          for(var b = 0 ; b != mapValues.length; b++)
          {
            if (b !== 0)
              idAsTab.push(BDA_REPOSITORY.MAP_SEPARATOR);
            idAsTab.push(mapValues[b]);
          }
        }
      }
      return idAsTab;
    },

    renderProperty : function(curProp, propValue, itemId, isItemTree)
    {
      var html = "";
      if (propValue !== null && propValue !== undefined)
      {
        propValue = propValue.replace(' ', '●');
        // Remove "_"
        if(curProp.name == "descriptor")
          propValue = propValue.substr(1);
          // propertyName_id
        var base_id = curProp.name + "_" + itemId;

        if (curProp.name == "id")
          html += "<td id='" + base_id + "'>" + propValue + "</td>";
       else if (propValue.length > 25)
        {
          var link_id = "link_" + base_id;
          var field_id = "text_" + base_id;
          propValue = "<a class='copyLink' href='javascript:void(0)' title='Show all' id='" + link_id + "' >"
          + "<span id='" + base_id + "'>" + BDA_REPOSITORY.escapeHTML(propValue.substr(0, 25)) + "...</a>"
          + "</span><textarea class='copyField' id='" + field_id + "' readonly>" + propValue + "</textarea>";
          html += "<td>" + propValue + "</td>";
        }
        else if (curProp.isId === true)
        {
            propValue = BDA_REPOSITORY.parseRepositoryId(propValue);
            html += "<td>";
            for (var b = 0; b != propValue.length; b++)
            {
              if (propValue[b] != BDA_REPOSITORY.MAP_SEPARATOR && propValue[b] != BDA_REPOSITORY.LIST_SEPARATOR)
              {
                if (isItemTree) // for item tree we create an anchor link
                  html += "<a class='clickable_property' href='#id_" + propValue[b] + "'>" + propValue[b] + "</a>";
                else
                  html += "<a class='clickable_property loadable_property' data-id='" + propValue[b] + "' data-descriptor='" + curProp.itemDesc + "'>" + propValue[b] + "</a>";
              }
              else
                html += propValue[b];
            }
          html += "</td>";
        }
        else if(curProp.name == "descriptor")
          html += '<td>' + propValue + "</td>";
        else
          html += '<td><i class="fa fa-pencil-square-o" aria-hidden="true"></i>' + propValue + "</td>";
      }
      else
      {
        html += "<td>&nbsp;</td>";
        //console.log("propValue not found : " + curProp.name + ", descriptor : " + itemDesc);
      }
      return html;
    },

    renderTab : function (types, datas, tabId, isItemTree)
    {
      var html = "";
      html += "<table class='dataTable' ";
      if (isItemTree)
        html += "id='" + tabId + "'";
      html += ">";
      for (var i = 0; i != types.length; i++)
      {
        var curProp = types[i];
        if (i % 2 === 0)
          html += "<tr class='even";
        else
          html += "<tr class='odd";

        if(curProp.name == "id")
          html += " id";
        else if (curProp.name == "descriptor")
          html += " descriptor";

        html += "'>";
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
          html += BDA_REPOSITORY.renderProperty(curProp, propValue, datas[a].id, isItemTree);
        }
        html += "</tr>";
      }
      html += "</table>";
      return html;
    },

    showXMLAsTab : function(xmlContent, $xmlDef, $outputDiv, isItemTree)
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
        if (!types[curItemDesc])
          types[curItemDesc] = [];
        if (!typesNames[curItemDesc])
          typesNames[curItemDesc] = [];
        if (!datas[curItemDesc])
        {
          datas[curItemDesc] = [];
          nbTypes++;
        }
        var curData = {};

        $(this).find("set-property").each(function (index) {
          var $curProp = $(this);
          curData[$curProp.attr("name")] = $curProp.text();
          var type = {};
          type.name = $curProp.attr("name");
          if ($.inArray(type.name, typesNames[curItemDesc]) == -1 )
          {
            type.rdonly = $curProp.attr("rdonly");
            type.derived = $curProp.attr("derived");
            type.exportable = $curProp.attr("exportable");
            var typeItemDesc = BDA_REPOSITORY.isTypeId(type.name, curItemDesc.substr(1), $xmlDef);
            if (typeItemDesc === null)
              type.isId = false;
            else
            {
              type.isId = true;
              type.itemDesc = typeItemDesc;
            }
            types[curItemDesc].push(type);
            typesNames[curItemDesc].push(type.name);
          }
        });
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
        curData.descriptor = curItemDesc;
        curData.id = $(this).attr("id");
        datas[curItemDesc].push(curData);
      });
      var startRenderingtab = new Date().getTime();
      var html = "<p class='nbResults'>" + $addItems.length + " items in " + nbTypes + " descriptor(s)</p>";
      var splitValue;
      var splitObj = BDA_STORAGE.getStoredSplitObj();
      if (splitObj === undefined || splitObj === null || splitObj.activeSplit === true)
        splitValue = 0;
      else
        splitValue = parseInt(splitObj.splitValue);
      for(var itemDesc in datas)
      {
        if (splitValue === 0)
          splitValue = datas[itemDesc].length;
        var nbTab = 0;
        if (datas[itemDesc].length <= splitValue)
        {
          html += BDA_REPOSITORY.renderTab(types[itemDesc], datas[itemDesc], itemDesc.substr(1), isItemTree);
        }
        else
        {
          while ((splitValue * nbTab) <  datas[itemDesc].length)
          {
            var start = splitValue * nbTab;
            var end = start + splitValue;
            if (end > datas[itemDesc].length)
              end = datas[itemDesc].length;
            var subDatas = datas[itemDesc].slice(start, end);
            html += BDA_REPOSITORY.renderTab(types[itemDesc], subDatas, itemDesc + "_" + nbTab, isItemTree);
            nbTab++;
          }
        }
      }
      $outputDiv.append(html);
      $outputDiv.prepend("<div class='prop_attr prop_attr_red'>R</div> : read-only "
          + "<div class='prop_attr prop_attr_green'>D</div> : derived "
          + "<div class='prop_attr prop_attr_blue'>E</div> : export is false");

      if ($(".copyField").length > 0)
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

      $(".loadable_property").click(function() {
        var $elm = $(this);
        var id = $elm.attr("data-id");
        var itemDesc = $elm.attr("data-descriptor");
        var query = "<print-item id='" + id + "' item-descriptor='" + itemDesc + "' />\n";
        if (confirm("You are about to add this query and reload the page : \n" + query))
        {
          BDA_REPOSITORY.setQueryEditorValue(BDA_REPOSITORY.getQueryEditorValue() + query);
          $("#RQLForm").submit();
        }
      });

      if (isItemTree)
        BDA_REPOSITORY.createSpeedbar();

        var endRenderingTab = new Date();
        var time = endRenderingTab.getTime() - startRenderingtab;
        console.log("time to render tab : " + time + "ms");
        return log;
    },

    showRQLLog : function (log, error)
    {
      console.log("Execution log : " + log);
      if (log && log.length > 0)
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

      var xmlContent = $(BDA_REPOSITORY.resultsSelector).next().text().trim();
      xmlContent = BDA_REPOSITORY.sanitizeXml(xmlContent);

      processRepositoryXmlDef("definitionFiles", function($xmlDef){
      var log = BDA_REPOSITORY.showXMLAsTab(xmlContent, $xmlDef, $("#RQLResults"), false);
      BDA_REPOSITORY.showRQLLog(log, false);
      // Move raw xml
      $(BDA_REPOSITORY.resultsSelector).next().appendTo("#rawXml");
      $(BDA_REPOSITORY.resultsSelector).remove();

      $("#rawXmlLink").click(function() {
        BDA_REPOSITORY.toggleRawXml();
        var xmlSize = $("#rawXml pre").html().length;
        console.log("raw XML size : " + xmlSize);
        console.log("XML max size : " + BDA_REPOSITORY.xmlDefinitionMaxSize);
        if (xmlSize < BDA_REPOSITORY.xmlDefinitionMaxSize)
        {
          $('#rawXml').each(function(i, block) {
            hljs.highlightBlock(block);
          });
        }
        else
        {
          // Check if button already exists
          if ($("#xmlHighlight").length === 0)
          {
            $("<p id='xmlHighlight' />")
            .html("The XML result is big, to avoid slowing down the page, XML highlight have been disabled. "
                + "<br> <button id='xmlHighlightBtn'>Highlight XML now</button> <small>(takes few seconds)</small>")
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
        BDA_REPOSITORY.showTextField($(this).attr("id").replace("link_", ""));
        });
      });
    },

    showRqlErrors : function ()
    {
      var error = "";
      if ($(BDA_REPOSITORY.errorsSelector1).length > 0)
      {
        console.log("Case of error  : 1");
        error = $(BDA_REPOSITORY.errorsSelector1).next().text();
        $(BDA_REPOSITORY.resultsSelector).next().remove();
        $(BDA_REPOSITORY.resultsSelector).remove();
        $(BDA_REPOSITORY.errorsSelector1).next().remove();
        $(BDA_REPOSITORY.errorsSelector1).remove();
      }
      else
      {
        console.log("Case of error  : 2");
        error = $(BDA_REPOSITORY.errorsSelector2).text();
      }
      error = BDA_REPOSITORY.purgeXml(error);
      BDA_REPOSITORY.showRQLLog(error, true);
    },

    escapeHTML : function (s)
    {
      return String(s).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

    //--- Item Tree functions ------------------------------------------------------------------------

    setupItemTreeForm : function()
    {
      $("<div id='itemTree' />").insertAfter("#RQLEditor");
      var $itemTree = $("#itemTree");
      $itemTree.append("<h2>Get Item Tree</h2>");
      $itemTree.append("<p>This tool will recursively retrieve items and print the result with the chosen output."
        +  "<br> For example, if you give an order ID in the form below, you will get all shipping groups, payment groups, commerceItems, priceInfo... of the given order"
        +  "<br><b> Be careful when using this tool on a live instance ! Set a low max items value.</b></p>");

      $itemTree.append("<div id='itemTreeForm'>"
          +"id : <input type='text' id='itemTreeId' /> &nbsp;"
        +  "descriptor :  <span id='itemTreeDescriptorField' ><select id='itemTreeDesc' class='itemDescriptor' >" + BDA_REPOSITORY.getDescriptorOptions() + "</select></span>"
        +  "max items : <input type='text' id='itemTreeMax' value='50' /> &nbsp;<br><br>"
        +  "output format :  <select id='itemTreeOutput'>"
        +  "<option value='HTMLtab'>HTML tab</option>"
        +  "<option value='addItem'>add-item XML</option>"
        +  "<option value='removeItem'>remove-item XML</option>"
        +  "<option value='printItem'>print-item XML</option>"
        +  "</select>&nbsp;"
        +  "<input type='checkbox' id='printRepositoryAttr' /><label for='printRepositoryAttr'>Print attribute : </label>"
        +  "<pre style='margin:0; display:inline;'>repository='"+ getCurrentComponentPath() + "'</pre> <br><br>"
        +  "<button id='itemTreeBtn'>Enter <i class='fa fa-play fa-x'></i></button>"
        + "</div>");
      $itemTree.append("<div id='itemTreeInfo' />");
      $itemTree.append("<div id='itemTreeResult' />");
      $("#itemTreeBtn").click(function() {
        var descriptor = $("#itemTreeDesc").val();
        var id = $("#itemTreeId").val().trim();
        var maxItem = parseInt($("#itemTreeMax").val());
        var outputType = $("#itemTreeOutput").val();
        var printRepoAttr = $("#printRepositoryAttr").is(':checked');
        console.log("max item : " + maxItem);
        BDA_REPOSITORY.getItemTree(id, descriptor, maxItem, outputType, printRepoAttr);
      });

    },

    getSubItems : function(items, $xmlDef, maxItem, outputType, printRepoAttr)
    {
      var nbItem =  BDA_REPOSITORY.itemTree.size;
      console.log("maxItem : " + maxItem + ", nbItem : " + nbItem);

      // Ensure that getSubItems is not call more than maxItem times
      if(nbItem >= maxItem)
      {
        console.log("max Item ("+maxItem+") reached, stopping recursion");
        return;
      }

      var xmlText = "";
      for(var batchSize = 0; batchSize != items.length; batchSize++)
      {
        // Don"t ask for more items than limit
        if ((BDA_REPOSITORY.nbItemReceived + batchSize) >= maxItem)
          break;
        xmlText += "<print-item id='" + items[batchSize].id + "' item-descriptor='" + items[batchSize].desc + "' />\n";
      }
      console.log(xmlText);
      console.log("batch size : " + batchSize);
      // Only request if the batchSize contains something
      if (batchSize > 0)
      {
        $.ajax({
          type: "POST",
          url: document.URL,
          data: { xmltext: xmlText},
          success: function(result, status, jqXHR) {

            var rawItemsXml = $(result).find("code").html();
            // remove first 2 lines
            var tab = rawItemsXml.split("\n");
            tab.splice(0,2);
            rawItemsXml = tab.join("\n").trim();
            // unescape HTML
            rawItemsXml = "<xml>" + rawItemsXml.replace(/&lt;/g, "<").replace(/&gt;/g, ">") + "</xml>";

            var xmlDoc = jQuery.parseXML(rawItemsXml);
            BDA_REPOSITORY.nbItemReceived += $(xmlDoc).find("add-item").length;
            $("#itemTreeInfo").html("<p>" + BDA_REPOSITORY.nbItemReceived + " items retrieved</p>");

            var subItems = [];
            $(xmlDoc).find("add-item").each(function() {
              var $itemXml = $(this);
              var itemId = $itemXml.attr("id");
              if(BDA_REPOSITORY.itemTree.get(itemId) === undefined)
              {
                  var rawItemXml = $itemXml[0].outerHTML;
                 // console.log("Add item to item tree : " + rawItemXml + " with ID : " + itemId);
                  BDA_REPOSITORY.itemTree.set(itemId, rawItemXml);
                  var descriptor = $itemXml.attr("item-descriptor");
                  var $itemDesc = $xmlDef.find("item-descriptor[name=" + descriptor + "]");
                  var superType = $itemDesc.attr("super-type");
                  while(superType !== undefined)
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
                      var subId = $itemXml.find("set-property[name="+subProperty+"]").text();
                      if ($elm.attr("repository") === undefined && subId.length > 0)
                      {
                          // avoid infinite recursion
                          if(BDA_REPOSITORY.itemTree.get(subId) === undefined)
                          {
                              //console.log({'id' : subId, 'desc' : $elm.attr("item-type")});
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
                      var subId = $itemXml.find("set-property[name="+subProperty+"]").text();
                      if ($elm.attr("repository") === undefined && subId.length > 0)
                      {
                          var desc = $elm.attr("component-item-type");
                          var ids = BDA_REPOSITORY.parseRepositoryId(subId);
                          for(var i = 0; i != ids.length; i++)
                          {
                            // avoid infinite recursion
                             if(ids[i] !== BDA_REPOSITORY.MAP_SEPARATOR && ids[i] !== BDA_REPOSITORY.LIST_SEPARATOR && BDA_REPOSITORY.itemTree.get(ids[i]) === undefined)
                                 subItems.push({'id' : ids[i], 'desc' : desc});
                           }
                      }
                  });
                }
            });

            console.log(subItems.length  + " items to retrieved in next request. Limit reach : " + (BDA_REPOSITORY.nbItemReceived >= maxItem));
            if (subItems.length > 0 && BDA_REPOSITORY.nbItemReceived < maxItem)
              BDA_REPOSITORY.getSubItems(subItems, $xmlDef, maxItem, outputType, printRepoAttr);
            else
              BDA_REPOSITORY.renderItemTreeTab(outputType, printRepoAttr, $xmlDef);
            },
          });
        }
        else
          console.log("Request is empty, nothing to do.");
    },

    getItemTree : function(id, descriptor, maxItem, outputType, printRepoAttr)
    {
      console.log("getItemTree - start");
      // reset divs
      $("#itemTreeResult").empty();
      $("#itemTreeInfo").empty();

      if (!id)
      {
        $("#itemTreeInfo").html("<p>Please provide a valid ID</p>");
        return ;
      }

      BDA_REPOSITORY.startGettingTree = new Date().getTime();

      // Get XML definition of the repository
      $("#itemTreeInfo").html("<p>Getting XML definition of this repository...</p>");
        var $xmlDef = processRepositoryXmlDef("definitionFiles", function($xmlDef){
        if (!$xmlDef)
        {
          $("#itemTreeInfo").html("<p>Unable to parse XML definition of this repository !</p>");
          return ;
        }
        console.log("descriptor : " + $xmlDef.find("item-descriptor").length);
        // get tree
        BDA_REPOSITORY.itemTree = new Map();
        BDA_REPOSITORY.nbItemReceived = 0;
        BDA_REPOSITORY.getSubItems([{'id' : id, 'desc' : descriptor}], $xmlDef, maxItem, outputType, printRepoAttr);
      });
    },

    renderItemTreeTab : function(outputType, printRepoAttr, $xmlDef)
    {
      console.log("Render item tree tab : " + outputType);
      $("#itemTreeInfo").empty();
      $("#itemTreeResult").empty();
      var res = "";
      if(outputType !== "HTMLtab")
      {
      console.log("Render copy button");
      $("#itemTreeInfo").append("<input type='button' id='itemTreeCopyButton' value='Copy result to clipboard'></input>");
          $('#itemTreeCopyButton').click(function(){
              copyToClipboard($('#itemTreeResult').text());
          });
      }
      if(outputType == "addItem")
      {
        BDA_REPOSITORY.itemTree.forEach(function(data, id) {
          if (printRepoAttr)
          {
            var xmlDoc = jQuery.parseXML(data);
            var $itemXml = $(xmlDoc).find("add-item");
            $itemXml.attr("repository", getCurrentComponentPath());
            res += $itemXml[0].outerHTML;
          }
          else
            res += data;
          res += "\n\n";
          }, BDA_REPOSITORY.itemTree);
          res = "<import-items>\n" + res + "\n</import-items>";
          $("#itemTreeResult").append("<pre />");
          $("#itemTreeResult pre").text(res);
        }
        else if (outputType == "HTMLtab")
        {
            BDA_REPOSITORY.itemTree.forEach(function(data, id) {
              res += data;
            }, BDA_REPOSITORY.itemTree);
            BDA_REPOSITORY.showXMLAsTab(res, $xmlDef, $("#itemTreeResult"), true);
        }
        else if (outputType == "removeItem" || outputType == "printItem")
        {
          BDA_REPOSITORY.itemTree.forEach(function(data, id) {
            var xmlDoc = jQuery.parseXML(data);
            var $itemXml = $(xmlDoc).find("add-item");
            res += "<";
            if (outputType == "removeItem")
              res += "remove-item";
            else
              res += "print-item";
            res += ' id="' + $itemXml.attr("id") + '" item-descriptor="' +  $itemXml.attr("item-descriptor") + "\"";
            if (printRepoAttr)
              res += " repository='"+ getCurrentComponentPath() +"'";
            res += ' />\n';
          }, BDA_REPOSITORY.itemTree);

          $("#itemTreeResult").append("<pre />");
          $("#itemTreeResult pre").text(res);
        }

        var endGettingTree = new Date();
        var time = endGettingTree.getTime() - BDA_REPOSITORY.startGettingTree;
        console.log("time to get item tree : " + time + "ms");
    },

    createSpeedbar : function()
    {
      var speedBarHtml = "<a class='close' href='javascript:void(0)'><i class='fa fa-times'></i></a><p>Quick links :</p><ul>";
      $("#itemTreeResult .dataTable").each(function(index) {
        var $tab = $(this);
        var id =  $tab.attr("id");
        var name = id;
        if (id.indexOf("_") != -1)
        {
          var tab = id.split("_");
          name = tab[1];
        }
        var nbItem = $tab.find("td").length / $tab.find("tr").length;
        speedBarHtml += "<li><i class='fa fa-arrow-right'></i>&nbsp;&nbsp;<a href='#" + id + "'>" + name.trim() + " (" + nbItem + ")</a></li>";
      });
      speedBarHtml += "</ul>";
      $("#itemTreeInfo").append("<div id='speedbar'><div id='widget' class='sticky'>" + speedBarHtml + "</div></div>");
      $('#speedbar .close').click(function() {
        $("#speedbar").fadeOut(200);
      });
        var stickyTop = $('.sticky').offset().top;
        $(window).scroll(function(){ // scroll event
          var windowTop = $(window).scrollTop();
          if (stickyTop < windowTop)
            $('.sticky').css({ position: 'fixed', top: 100 });
          else
            $('.sticky').css('position','static');
        });
    },


    showQueryList : function ()
    {
      var html = "";
        var rqlQueries = BDA_REPOSITORY.purgeRQLQuery(BDA_STORAGE.getStoredRQLQueries());
        if (rqlQueries && rqlQueries.length > 0)
        {
          html += "<span class='storedQueriesTitle'>Stored queries :</span>";
          html += "<ul>";
          for (var i = 0; i != rqlQueries.length; i++)
          {
            var storeQuery = rqlQueries[i];
            var escapedQuery =  $("<div>").text(storeQuery.query).html();

            html += "<li class='savedQuery'>";
            html += "<a href='javascript:void(0)'>" + storeQuery.name + "</a>";
            html += "<span id='previewQuery" + i + "'class='previewQuery'>";
            html += "<i class='fa fa-eye'></i>";
            html += "</span>";
            html += "<span id='deleteQuery" + i + "'class='deleteQuery'>";
            html += "<i class='fa fa-trash-o'></i>";
            html += "</span>";
            html += "<span id='queryView" + i + "'class='queryView'>";
            html += "<pre>" + escapedQuery + "</pre>";
            html += "</span>";
            html += "</li>";
          }
          html += "</ul>";
        }
      $("#storedQueries").html(html);

      $('#storedQueries .queryView').each(function(i, block) {
        hljs.highlightBlock(block);
      });

      $(".savedQuery").click(function() {
        console.log("click on query : " + $(this).find("a").html());
        BDA_REPOSITORY.printStoredQuery( $(this).find("a").html());
      });

      $(".previewQuery").hover( function() {
        $(this).parent("li").find("span.queryView").toggle();
      }, function() {
        $(this).parent("li").find("span.queryView").toggle();
      });

      $(".deleteQuery")
      .click(function() {
        var index = this.id.replace("deleteQuery", "");
        console.log("Delete query #" + index);
        BDA_STORAGE.deleteRQLQuery(index);
        BDA_REPOSITORY.reloadQueryList();
      });
    },

    purgeRQLQuery : function (rqlQueries)
    {
      // Purge query
      var purgedRqlQueries = [];
      for (var i = 0; i != rqlQueries.length; i++)
      {
        var query = rqlQueries[i];
        if (!query.hasOwnProperty("repo") || query.repo == getComponentNameFromPath(getCurrentComponentPath())) {
          purgedRqlQueries.push(rqlQueries[i]);
        }
      }
      return purgedRqlQueries;
    },

    reloadQueryList : function ()
    {
      $("#storedQueries").empty();
      BDA_REPOSITORY.showQueryList();
    },

    printStoredQuery : function (name)
    {
      console.log("printStoredQuery : " + name);
      var rqlQueries = BDA_STORAGE.getStoredRQLQueries();
      console.log(rqlQueries);
      if (rqlQueries)
      {
        for (var i = 0; i != rqlQueries.length; i++)
        {
          if (rqlQueries[i].name == name)
            BDA_REPOSITORY.setQueryEditorValue(rqlQueries[i].query + "\n");
        }
      }
    },

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
      var $cacheUsage = $(BDA_REPOSITORY.cacheUsageSelector);
      $cacheUsage.next().toggle().next().toggle();
      BDA_REPOSITORY.toggleShowLabel($cacheUsage.next().css("display"), "#showMoreCacheUsage");
      BDA_STORAGE.storeToggleState("showMoreCacheUsage", $cacheUsage.next().css("display"));
    },

    toggleRepositoryView : function ()
    {
      $(BDA_REPOSITORY.repositoryViewSelector).next().toggle().next().toggle();
      BDA_REPOSITORY.toggleShowLabel($(BDA_REPOSITORY.repositoryViewSelector).next().css("display"), "#showMoreRepositoryView");
      BDA_STORAGE.storeToggleState("showMoreRepositoryView", $(BDA_REPOSITORY.repositoryViewSelector).next().css("display"));
    },

    toggleProperties : function ()
    {
      $(BDA_REPOSITORY.propertiesSelector).next().toggle();
      BDA_REPOSITORY.toggleShowLabel($(BDA_REPOSITORY.propertiesSelector).next().css("display"), "#showMoreProperties");
      BDA_STORAGE.storeToggleState("showMoreProperties", $(BDA_REPOSITORY.propertiesSelector).next().css("display"));
    },

    toggleEventSets : function ()
    {
      $(BDA_REPOSITORY.eventSetsSelector).next().toggle();
      BDA_REPOSITORY.toggleShowLabel($(BDA_REPOSITORY.eventSetsSelector).next().css("display"), "#showMoreEventsSets");
      BDA_STORAGE.storeToggleState("showMoreEventsSets", $(BDA_REPOSITORY.eventSetsSelector).next().css("display"));
    },

    toggleMethods : function ()
    {
      $(BDA_REPOSITORY.methodsSelector).next().toggle();
      BDA_REPOSITORY.toggleShowLabel($(BDA_REPOSITORY.methodsSelector).next().css("display"), "#showMoreMethods");
      BDA_STORAGE.storeToggleState("showMoreMethods", $(BDA_REPOSITORY.methodsSelector).next().css("display"));
    },

    toggleRawXml : function ()
    {
      $("#rawXml").toggle();
      if ($("#rawXml").css("display") == "none")
        $("#rawXmlLink").html("show raw XML");
      else
        $("#rawXmlLink").html("hide raw XML");
    },

    // simply handles an ajax call to a repository and parse the result
    // xmltext : full xml text
    // repository : only the strict nucleus path
    // callback : take 1 param : array of add-items
    executeQuery : function(xmltext,repository,callback,errCallback){

       $.ajax({
          type: "POST",
          url: "/dyn/admin/nucleus/{0}/".format(repository),
          data: { xmltext: xmltext},
          success: function(result, status, jqXHR) {
            var rawItemsXml = $(result).find("code").html();
            // remove first 2 lines
            var tab = rawItemsXml.split("\n");
            tab.splice(0,2);
            rawItemsXml = tab.join("\n").trim();
            // unescape HTML
            rawItemsXml = "<xml>" + rawItemsXml.replace(/&lt;/g, "<").replace(/&gt;/g, ">") + "</xml>";
            var xmlDoc = jQuery.parseXML(rawItemsXml);
            callback($(xmlDoc));
          },
          error: function(result, status, jqXHR) {
            if(!isNull(errCallback)){
              errCallback();
            }
          }
        })
    },

    executePrintItem : function(itemDescriptor,id,repository,callback,errCallback){
      var xmlText = BDA_REPOSITORY.templates.printItem.format(itemDescriptor,id);
      BDA_REPOSITORY.executeQuery(xmlText,repository,callback,errCallback);
    }
  };

  // Reference to BDA_STORAGE
  var BDA_STORAGE;

  // Jquery plugin creation
  $.fn.bdaRepository = function()
   {
        console.log('Init plugin {0}'.format('bdaRepository'));
        //settings = $.extend({}, defaults, options);
        BDA_STORAGE = $.fn.bdaStorage.getBdaStorage();
        BDA_REPOSITORY.build();
    return this;
  };

   $.fn.bdaRepository.reloadQueryList = function() {
     if (BDA_REPOSITORY.isRepositoryPage)
       BDA_REPOSITORY.reloadQueryList();
   };

   $.fn.executePrintItem = function(itemDescriptor,id,repository,callback,errCallback){
     BDA_REPOSITORY.executePrintItem(itemDescriptor,id,repository,callback,errCallback);
   };

  console.log("bda.repository.js end");
})(jQuery);
