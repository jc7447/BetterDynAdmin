(function($) {

  var tags = {
    '!top': ['add-item', 'query-items', 'print-item', 'remove-item'],
    '!attrs': {},
    'toto': {

    },
    'add-item': {
      attrs: {
        'id': null,
        'item-descriptor': null
      },
      children: ['set-property']
    },
    'print-item': {
      attrs: {
        'id': null,
        'item-descriptor': null
      },
      children: []
    },
    'remove-item': {
      attrs: {
        'id': null,
        'item-descriptor': null
      },
      children: ['set-property']
    },
    'query-items': {
      attrs: {
        'item-descriptor': null,
        'id-only': ['true', 'false']
      },
      children: []
    },
    'set-property': {
      attrs: {
        name: null
      },
      children: []
    }
  };

  var Repository = function(data) {
    this.path;
    this.xmlDefinition;
    this.descriptors = {}
    _.merge(this, data);
  }
  Repository.prototype.getItemDescriptor = function(itemDescriptorName) {
    let desc = this.descriptors[itemDescriptorName]
    if (_.isNil(desc) && !_.isNil(this.xmlDefinition)) {
      desc = BDA_REPOSITORY.buildItemDescriptor(itemDescriptorName, this.xmlDefinition, this);
      this.descriptors[itemDescriptorName] = desc;
    }
    return desc;
  }

  var ItemDescriptor = function(data) {
    this.properties = {}; //PropertyDescriptor
    this.name;
    this.xmlDefinition;
    _.merge(this, data);

  }
  var PropertyDescriptor = function($xmlDefinition, repository) {
    this.xmlDefinition = $xmlDefinition;
    if (this.xmlDefinition) {
      this.name = this.xmlDefinition.attr('name');
      this.type = this.xmlDefinition.attr('type');
      this.itemType = this.xmlDefinition.attr('item-type');
      this.otherRepositoryPath = this.xmlDefinition.attr('repository');
      this.componentItemType = this.xmlDefinition.attr('component-item-type');

      if (!!this.itemType || !!this.componentItemType) {
        this.isItem = true;
        this.isItemOfSameRepository = _.isNil(this.otherRepositoryPath);
        if (this.isItemOfSameRepository) {
          this.itemRepository = repository.path;
        } else {
          this.itemRepository = this.otherRepositoryPath;
        }
        this.isMulti = !!this.componentItemType;
        if (!!this.componentItemType) {
          this.itemType = this.componentItemType; //simplify by using one property
        }
      }
    }
  }

  var RepositoryItem = function(data) {
    this.itemDescriptor;
    this.id;
    this.repository;
    this.values = {}; // PropertyValue
    _.merge(this, data);

    // init default values
    if (!_.isNil(this.itemDescriptor)) {
      _(this.itemDescriptor.properties)
        .filter(propDesc => !_.isEmpty(propDesc.defaultValue))
        .each(propDesc => {
          this.values[propDesc.name] = new PropertyValue(propDesc);
        });
    }

  }
  RepositoryItem.prototype.hasValueFor = function(propertyName) {
    return !_.isNil(this.values[propertyName]) && !_.isEmpty(this.values[propertyName].value)
  }

  var PropertyValue = function(descriptor, xmlValue) {
    this.descriptor = descriptor;
    this.xmlValue = xmlValue;
    if (!_.isNil(xmlValue)) {
      this.setValueFromXml(xmlValue)
    } else if (!_.isNil(descriptor)) {
      this.value = descriptor.defaultValue;
      this.isDefault = true;
    }
    this.isDefault;
    // get attribues from the xml result, not the descriptor
    if (!_.isNil(this.xmlValue)) {
      this.rdonly = this.xmlValue.attr('rdonly');
      this.derived = this.xmlValue.attr('derived');
      this.exportable = this.xmlValue.attr('exportable');
    }
  }
  PropertyValue.prototype.setValueFromXml = function(xmlValue) {
    this.value = xmlValue.text();
    this.isDefault = false;
  }
  "use scrict";
  var BDA_REPOSITORY = {

    repositories: {},

    CELL_MAX_LENGTH: 23,

    PERF_MONITOR: null,

    MAP_SEPARATOR: "=",
    LIST_SEPARATOR: ",",
    descriptorTableSelector: "table:eq(0)",
    repositoryViewSelector: "h2:contains('Examine the Repository, Control Debugging')",
    cacheUsageSelector: "h2:contains('Cache usage statistics')",
    propertiesSelector: "h1:contains('Properties')",
    eventSetsSelector: "h1:contains('Event Sets')",
    methodsSelector: "h1:contains('Methods')",
    resultsSelector: "h2:contains('Results:')",
    errorsSelector1: "p:contains('Errors:')",
    errorsSelector2: "code:contains('*** Query:')",
    defaultItemByTab: "10",
    nbItemReceived: 0,
    itemTree: new Map(),
    defaultDescriptor: {
      "OrderRepository": "order",
      "CsrRepository": "returnRequest",
      "ProfileAdapterRepository": "user",
      "ProductCatalog": "sku",
      "InventoryRepository": "inventory",
      "PriceLists": "price"
    },
    xmlDefinitionMaxSize: 150000, // 150 Ko
    queryEditor: null,
    descriptorList: null,
    isRepositoryPage: false,
    hasErrors: false,
    hasResults: false,
    templates: {
      printItem: '<print-item item-descriptor="{0}" id="{1}"/>',
      queryItems: '<query-items item-descriptor="{0}">\n{1}\n</query-items>',
      resultHeader: '<p class="nbResults"> {0} items in {1} descriptor(s)</p>',
      resultTable: '<table class="dataTable twbs" data-descriptor="{0}" data-repository="{1}"></table>',
      idCell: '<td class="property idCell" data-identifier="id_{0}_{1}" data-id="{0}" data-item="{1}" data-repository="{2}" >' +
        '<div class="flex-wrapper">' +
        '<div class="value-elem">{0}</div>' +
        '<span class="actions">' +
        '<i class="fa fa-refresh action reload-item" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Refresh this item\'s view"></i>' +
        '<i class="fa fa-code action copy-xml" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Copy xml to clipboard"></i>' +
        '<i class="fa fa-close action close-elem" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Close the view for this item"></i>' +
        '</div>' +
        '</span>' +
        '</div>' +
        '</td>',
      descriptorCell: '<td data-id="{1}">{0}</td>',
      propertyCell: '<td data-property="{2}" data-id="{1}" class="property show-short {3} {4}"><div class="flex-wrapper">' +
        '{0}' +
        '<span class="actions">' +
        '<i class="fa fa-edit action start-edit" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Edit this field"></i>' +
        '<i class="fa fa-compress action collapse" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Collapse view"></i>' +
        '<i class="fa fa-expand action expand" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Expand this field"></i>' +
        '<i class="fa fa-spinner fa-spin passive-loading-icon" aria-hidden="true"></i>' +
        '</span>' +
        '</div></td>',
      shortPropertyCell: '<div class="value-elem propertyValue" data-raw="{0}">{1}</div>',
      longPropertyCell: '<span class="value-elem long propertyValue" data-raw="{1}">{2}</span><span class="value-elem short">{0}</span>',
      editProperty: '<update-item item-descriptor="{0}" id="{1}">\n    <set-property name="{2}"><![CDATA[{3}]]></set-property>\n</update-item>',
      progressBar: '<div class="twbs wrapper"><div class="progress">' +
        '<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="min-width: 300px; width: 2%;">' +
        'Rendering {0}/{1} repository items' +
        '</div>' +
        '</div></div>'


    },
    cmAutocomplete: {
      tags: {
        '!top': ['add-item', 'query-items', 'print-item', 'remove-item'],
        '!attrs': {},
        'toto': {

        },
        'add-item': {
          attrs: {
            'id': null,
            'item-descriptor': null
          },
          children: ['set-property']
        },
        'print-item': {
          attrs: {
            'id': null,
            'item-descriptor': null
          },
          children: []
        },
        'remove-item': {
          attrs: {
            'id': null,
            'item-descriptor': null
          },
          children: ['set-property']
        },
        'query-items': {
          attrs: {
            'item-descriptor': null,
            'id-only': ['true', 'false']
          },
          children: []
        },
        'set-property': {
          attrs: {
            name: null
          },
          children: []
        }
      },
    },
    CACHE_STAT_TITLE_REGEXP: /item-descriptor=(.*) cache-mode=(.*)( cache-locality=(.*))?/,
    edgesToIgnore: ["order", "relationships", "orderRef"],

    build: function() {
      console.time("bdaRepository");
      BDA_REPOSITORY.PERF_MONITOR = new PerformanceMonitor(true);
      BDA_REPOSITORY.isRepositoryPage = BDA_REPOSITORY.isRepositoryPageFct();
      BDA_REPOSITORY.hasErrors = BDA_REPOSITORY.hasErrorsFct();
      BDA_REPOSITORY.hasResults = BDA_REPOSITORY.hasResultsFct(BDA_REPOSITORY.hasErrors);
      logTrace("isRepositoryPage : " + BDA_REPOSITORY.isRepositoryPage + " Page has results : " + BDA_REPOSITORY.hasResults + ". Page has errors : " + BDA_REPOSITORY.hasErrors);
      // Setup repository page
      if (BDA_REPOSITORY.isRepositoryPage)
        BDA_REPOSITORY.setupRepositoryPage();
      console.timeEnd("bdaRepository");
    },

    isRepositoryPageFct: function() {
      return $("h2:contains('Run XML Operation Tags on the Repository')").length > 0;
    },

    setupRepositoryPage: function() {
      // Move RQL editor to the top of the page

      console.time('preparePage');

      BDA_REPOSITORY.PERF_MONITOR.reset();

      $(BDA_REPOSITORY.descriptorTableSelector).attr("id", "descriptorTable");

      //save the native form in variable before adding more forms with the showRQLResults methods (inline forms)
      BDA_REPOSITORY.initialForm = $("form:eq(1)");

      $("<div id='RQLEditor'></div>").insertBefore("h2:first");
      $("<div id='RQLResults'></div>").insertBefore("#RQLEditor");
      if (BDA_REPOSITORY.hasErrors)
        BDA_REPOSITORY.showRqlErrors();
      if (BDA_REPOSITORY.hasResults && !BDA_REPOSITORY.hasErrors) {
        // make it async so that the results are rendered after the rest of BDA loads
        setTimeout(function() {
          BDA_REPOSITORY.showRQLResults();
        }, 50);
      }

      BDA_REPOSITORY.initialForm
        .appendTo("#RQLEditor")
        .attr("id", "RQLForm");
      var $children = $("#RQLForm").children();
      $("#RQLForm").empty().append($children);
      $("textarea[name=xmltext]").attr("id", "xmltext");

      var actionSelect = "<select id='RQLAction' class='js-example-basic-single' style='width:170px'>" + " <optgroup label='Empty queries'>" + "<option value='print-item'>print-item</option>" + "<option value='query-items'>query-items</option>" + "<option value='remove-item'>remove-item</option>" + "<option value='add-item'>add-item</option>" + "<option value='update-item'>update-item</option>" + "</optgroup>" + " <optgroup label='Predefined queries'>" + "<option value='all'>query-items ALL</option>" + "<option value='last_10_ordered'>query-items last 10 order by id</option>" + "<option value='last_10'>query-items last 10</option>" + "</optgroup>" + "</select>";

      $("<div id='RQLToolbar'></div>").append("<div> Action : " + actionSelect + " <span id='editor'>" + "<span id='itemIdField' >ids : <input type='text' id='itemId' placeholder='Id1,Id2,Id3' /></span>" + "<span id='itemDescriptorField' > descriptor :  <select id='itemDescriptor' class='itemDescriptor' >" + BDA_REPOSITORY.getDescriptorOptions() + "</select></span>" + "<span id='idOnlyField' style='display: none;'><label for='idOnly'>&nbsp;id only : </label><input type='checkbox' id='idOnly'></input></span>" + "</span>" + BDA_REPOSITORY.getsubmitButton() + "</div>")
        .insertBefore("#RQLEditor textarea")
        .after("<div id='RQLText'></div>");

      $("#xmltext").appendTo("#RQLText");
      $("#RQLText").after("<div id='tabs'>" + "<ul id='navbar'>" + "<li id='propertiesTab' class='selected'>Properties</li>" + "<li id='queriesTab'>Stored Queries</li>" + "</ul>" + "<div id='storedQueries'><i>No stored query for this repository</i></div>" + "<div id='descProperties'><i>Select a descriptor to see his properties</i></i></div>" + "</div>");

      $("#RQLForm input[type=submit]").remove();

      var splitObj = BDA_STORAGE.getStoredSplitObj();
      var itemByTab = BDA_REPOSITORY.defaultItemByTab;
      var isChecked = false;
      if (splitObj) {
        itemByTab = splitObj.splitValue;
        isChecked = splitObj.activeSplit;
      }
      var checkboxSplit = "<input type='checkbox' id='noSplit' ";
      if (isChecked)
        checkboxSplit += " checked ";
      checkboxSplit += "/> don't split.";

      $("#tabs").after("<div id='RQLSave'>" + "<div style='display:inline-block;width:200px'><button id='clearQuery' type='button'>Clear <i class='fa fa-ban fa-x'></i></button></div>" + "<div style='display:inline-block;width:530px'>Split tab every :  <input type='text' value='" + itemByTab + "' id='splitValue'> items. " + checkboxSplit + "</div>" + "<button type='submit' id='RQLSubmit'>Enter <i class='fa fa-play fa-x'></i></button>" + "</div>" + "<div><input placeholder='Name this query' type='text' id='queryLabel'>&nbsp;<button type='button' id='saveQuery'>Save <i class='fa fa-save fa-x'></i></button></div>");
      console.timeEnd('preparePage');

      console.time('showQueryList');
      BDA_REPOSITORY.showQueryList();
      console.timeEnd('showQueryList');

      console.time('setupItemTreeForm');
      BDA_REPOSITORY.setupItemTreeForm();
      console.timeEnd('setupItemTreeForm');

      console.time('setupItemDescriptorTable');
      BDA_REPOSITORY.setupItemDescriptorTable();
      console.timeEnd('setupItemDescriptorTable');

      console.time('setupPropertiesTables');
      BDA_REPOSITORY.setupPropertiesTables();
      console.timeEnd('setupPropertiesTables');

      var defaultDescriptor = BDA_REPOSITORY.defaultDescriptor[getComponentNameFromPath(getCurrentComponentPath())];
      if (defaultDescriptor !== undefined)
        BDA_REPOSITORY.showItemPropertyList(defaultDescriptor);

      // Default tab position
      $("#descProperties").css("display", "inline-block");
      $("#storedQueries").css("display", "none");

      $("#queriesTab").click(function() {
        logTrace("show stored queries");
        $("#descProperties").css("display", "none");
        $("#storedQueries").css("display", "inline-block");
        $(this).addClass("selected");
        $("#propertiesTab").removeClass("selected");
      });

      $("#propertiesTab").click(function() {
        logTrace("show properties");
        $("#descProperties").css("display", "inline-block");
        $("#storedQueries").css("display", "none");
        $(this).addClass("selected");
        $("#queriesTab").removeClass("selected");

      });

      $("#RQLAction").change(function() {
        var action = $(this).val();
        logTrace("Action change : " + action);
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
        if (BDA_REPOSITORY.getQueryEditorValue().trim().length > 0 && $("#queryLabel").val().trim().length > 0) {
          BDA_STORAGE.storeRQLQuery($("#queryLabel").val().trim(), BDA_REPOSITORY.getQueryEditorValue().trim());
          BDA_REPOSITORY.showQueryList();
        }
      });

      $("#clearQuery").click(function() {
        BDA_REPOSITORY.setQueryEditorValue("");
      });

      // Hide other sections
      var toggleObj = BDA_STORAGE.getToggleObj();

      var repositoryView = "<a href='javascript:void(0)' id='showMoreRepositoryView' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreRepositoryView) + "</a>";
      var cacheUsage = "&nbsp;<a href='javascript:void(0)' id='showMoreCacheUsage' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreCacheUsage) + "</a>";
      var properties = "&nbsp;<a href='javascript:void(0)' id='showMoreProperties' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreProperties) + "</a>";
      var eventSets = "&nbsp;<a href='javascript:void(0)' id='showMoreEventsSets' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreEventsSets) + "</a>";
      var methods = "&nbsp;<a href='javascript:void(0)' id='showMoreMethods' class='showMore'>" + BDA_REPOSITORY.getToggleLabel(toggleObj.showMoreMethods) + "</a>";

      // Auto hide Repository View
      $(BDA_REPOSITORY.repositoryViewSelector).append(repositoryView);

      if (toggleObj.hasOwnProperty("showMoreRepositoryView") && toggleObj.showMoreRepositoryView == 0)
        BDA_REPOSITORY.toggleRepositoryView();
      $("#showMoreRepositoryView").click(function() {
        BDA_REPOSITORY.toggleRepositoryView();
      });

      //setup cache section before hidding it
      BDA_REPOSITORY.setupRepositoryCacheSection();

      // Auto hide Cache usage
      $(BDA_REPOSITORY.cacheUsageSelector).append(cacheUsage);
      if (toggleObj.showMoreCacheUsage != 1)
        BDA_REPOSITORY.toggleCacheUsage();
      $("#showMoreCacheUsage").click(function() {
        BDA_REPOSITORY.toggleCacheUsage();
      });
      // Auto hide Properties
      $(BDA_REPOSITORY.propertiesSelector).append(properties);
      if (toggleObj.showMoreProperties != 1)
        BDA_REPOSITORY.toggleProperties();
      $("#showMoreProperties").click(function() {
        BDA_REPOSITORY.toggleProperties();
      });
      // Auto hide Events Sets
      $(BDA_REPOSITORY.eventSetsSelector).append(eventSets);
      if (toggleObj.showMoreEventsSets != 1)
        BDA_REPOSITORY.toggleEventSets();
      $("#showMoreEventsSets").click(function() {
        BDA_REPOSITORY.toggleEventSets();
      });
      // Auto hide Methods
      $(BDA_REPOSITORY.methodsSelector).append(methods);
      if (toggleObj.showMoreMethods != 1)
        BDA_REPOSITORY.toggleMethods();
      $("#showMoreMethods").click(function() {
        BDA_REPOSITORY.toggleMethods();
      });

      console.time('initCodeMirror');
      BDA_REPOSITORY.queryEditor = BDA_REPOSITORY.initCodeMirror(true);
      console.timeEnd('initCodeMirror');

      console.time('initSelect2');

      // Init select2 plugin
      $("#RQLAction").select2({
        width: "style",
        containerCssClass: 'bda-repository',
        dropdownCssClass: 'bda-repository',
        minimumResultsForSearch: -1
      });

      $(".itemDescriptor").select2({
        placeholder: "Select a descriptor",
        allowClear: false,
        width: "element",
        containerCssClass: 'bda-repository',
        dropdownCssClass: 'bda-repository',
        matcher: function(params, data) {
          // If there are no search terms, return all of the data
          if ($.trim(params) === '') {
            return data;
          }
          data = data.toUpperCase();
          params = params.toUpperCase();
          // `params.term` should be the term that is used for searching
          // `data.text` is the text that is displayed for the data object
          if (data.indexOf(params) != -1)
            return true;
          return false;
        }
      });

      $("#itemDescriptor").on("select2-selecting", function(e) {
        BDA_REPOSITORY.showItemPropertyList(e.val);
      });

      console.timeEnd('initSelect2');


    },

    initCodeMirror: function(autocomplete) {

      var editor;
      if (autocomplete) {

        //inner functions for auto-complete
        //taken from CM XML hint demo
        //tryed to define them elsewhere but it broke the completion...
        function completeAfter(cm, pred) {
          var cur = cm.getCursor();
          if (!pred || pred()) setTimeout(function() {
            if (!cm.state.completionActive)
              cm.showHint({
                completeSingle: false
              });
          }, 100);
          return CodeMirror.Pass;
        }

        function completeIfAfterLt(cm) {
          return completeAfter(cm, function() {
            var cur = cm.getCursor();
            return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
          });
        }

        function completeIfInTag(cm) {
          return completeAfter(cm, function() {
            var tok = cm.getTokenAt(cm.getCursor());
            if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
            var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
            return inner.tagName;
          });
        }


        // Init code mirror
        editor = CodeMirror.fromTextArea(document.getElementById("xmltext"), {
          lineNumbers: false,
          mode: 'xml',
          extraKeys: {
            "'<'": completeAfter,
            "'/'": completeIfAfterLt,
            "' '": completeIfInTag,
            "'='": completeIfInTag,
            "Ctrl-Space": "autocomplete"
          },
          hintOptions: {
            schemaInfo: tags
          }
        });

        // HACK
        // on FF + greasemonkey, the hint is not updated when it's already open
        // mostly working, yet a bit clunky
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
          CodeMirror.on(editor, "cursorActivity", function(cm, object) {
            if (cm.state.completionActive) {
              cm.showHint({
                completeSingle: false
              });
            }
          })
        }
      } else {

        // Init code mirror
        editor = CodeMirror.fromTextArea(document.getElementById("xmltext"), {
          lineNumbers: false,
        });

      }
      return editor;
    },


    addToQueryEditor: function(query) {
      var editor = BDA_REPOSITORY.queryEditor;
      var editorCursor = editor.getCursor();
      if (editorCursor.ch !== 0)
        editor.setCursor(editor.getCursor().line + 1, 0);

      BDA_REPOSITORY.queryEditor.replaceSelection(query);
    },

    setupPropertiesTables: function() {
      if ($("a[name=showProperties]").length > 0) {
        $("a[name=showProperties]").next().attr("id", "propertiesTable");
        $("#propertiesTable").find("tr:nth-child(odd)").addClass("odd");
      }
    },

    setupItemDescriptorTable: function() {
      var descriptors = BDA_REPOSITORY.getDescriptorList();
      var componentURI = window.location.pathname;
      var splitValue = 20;
      var html = "<p>" + descriptors.length + " descriptors available.</p>";
      html += "<div>";
      for (var i = 0; i != descriptors.length; i++) {
        if (i === 0 || i % splitValue === 0) {
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
        else {
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


    showItemPropertyList: function(item) {
      logTrace("showItemPropertyList");
      var componentURI = window.location.pathname;
      var url = componentURI + "?action=seetmpl&itemdesc=" + item + "#showProperties";
      $.get(url, function(data) {
        logTrace("Enter showItemPropertyList callback");
        var $pTable = $(data).find("a[name='showProperties']").next();
        $pTable.find('th:nth-child(2), td:nth-child(2),th:nth-child(4), td:nth-child(4),th:nth-child(5), td:nth-child(5),th:nth-child(6), td:nth-child(6)').remove();
        $pTable.find("tr").each(function(index) {
          var $tr = $(this);
          $tr.find("td").each(function(i) {
            var $td = $(this);
            if (i === 0) {
              var content = $td.html();
              var req = /[\w\s']+\((\w+)\)$/i;
              content = content.replace(req, "<a class='itemPropertyBtn' href='javascript:void(0)'> $1 </a>");
              $td.html(content);
            } else if (i === 1)
              $td.text($td.text().replace("Class", ""));

          });
        });
        logTrace($pTable);
        $("#descProperties")
          .empty()
          .append($pTable);

        $('.itemPropertyBtn').click(function(item) {
          BDA_REPOSITORY.addToQueryEditor('<set-property name="' + $(this).text().trim() + '"><![CDATA[]]></set-property>\n');
        });
      });
    },

    hasResultsFct: function(hasErrors) {
      return $(BDA_REPOSITORY.resultsSelector).length > 0;
    },

    hasErrorsFct: function() {
      return $(BDA_REPOSITORY.errorsSelector1).length > 0 || $(BDA_REPOSITORY.errorsSelector2).length > 0;
    },


    getDescriptorList: function() {
      if (BDA_REPOSITORY.descriptorList)
        return BDA_REPOSITORY.descriptorList;
      var descriptors = [];
      $("#descriptorTable tr th:first-child:not([colspan])")
        .sort(function(a, b) {
          return $(a).text().toLowerCase() > $(b).text().toLowerCase() ? 1 : -1;
        }).each(function() {

          descriptors.push($(this).html().trim());
        });
      BDA_REPOSITORY.descriptorList = descriptors;
      return descriptors;
    },

    getDescriptorOptions: function() {
      var descriptorOptions = "";
      var descriptors = BDA_REPOSITORY.getDescriptorList();
      descriptorOptions = "";
      var defaultDesc = BDA_REPOSITORY.defaultDescriptor[getComponentNameFromPath(getCurrentComponentPath())];
      if (defaultDesc === undefined)
        descriptorOptions = "<option></option>";
      for (var i = 0; i != descriptors.length; i++) {
        descriptorOptions += "<option value='" + descriptors[i] + "'";
        if (defaultDesc === descriptors[i])
          descriptorOptions += "selected='selected'";
        descriptorOptions += ">" + descriptors[i] + "</option>\n";
      }
      return descriptorOptions;
    },

    getsubmitButton: function() {
      return "<button type='button' id='RQLAdd'>Add</button>" + "<button type='button' id='RQLGo'>Add & Enter <i class='fa fa-play fa-x'></i></button>";
    },

    getPrintItemEditor: function() {
      $("#itemIdField").show();
      $("#itemDescriptorField").show();
      $("#idOnlyField").hide();
    },

    getAddItemEditor: function() {
      $("#itemIdField").hide();
      $("#itemDescriptorField").show();
      $("#idOnlyField").hide();
    },

    getRemoveItemEditor: function() {
      BDA_REPOSITORY.getPrintItemEditor();
    },

    getRemoveItemsEditor: function() {
      BDA_REPOSITORY.getPrintItemEditor();
    },

    getUpdateItemEditor: function() {
      BDA_REPOSITORY.getPrintItemEditor();
    },

    getQueryItemsEditor: function() {
      $("#itemIdField").hide();
      $("#itemDescriptorField").show();
      $("#idOnlyField").show();
    },

    getMultiId: function() {
      var ids = $("#itemId").val().trim();
      if (ids.indexOf(",") != -1)
        return ids.split(",");
      return [ids];
    },

    getPrintItemQuery: function() {
      var ids = BDA_REPOSITORY.getMultiId();
      var descriptor = $("#itemDescriptor").val();
      var query = "";
      for (var i = 0; i != ids.length; i++)
        query += "<print-item id=\"" + ids[i].trim() + "\" item-descriptor=\"" + descriptor + "\" />\n";
      return query;
    },

    getRemoveItemQuery: function() {
      var ids = BDA_REPOSITORY.getMultiId();
      var descriptor = $("#itemDescriptor").val();
      var query = "";
      for (var i = 0; i != ids.length; i++)
        query += "<remove-item id=\"" + ids[i].trim() + "\" item-descriptor=\"" + descriptor + "\" />\n";
      return query;
    },

    getAddItemQuery: function() {
      var descriptor = $("#itemDescriptor").val();
      var query = "<add-item item-descriptor=\"" + descriptor + "\" >\n";
      query += "  <set-property name=\"\"><![CDATA\[]]></set-property>\n";
      query += "</add-item>\n";
      return query;
    },

    getUpdateItemQuery: function() {
      var descriptor = $("#itemDescriptor").val();
      var ids = BDA_REPOSITORY.getMultiId();
      var query = "";
      for (var i = 0; i != ids.length; i++) {
        query += "<update-item id=\"" + ids[i] + "\" item-descriptor=\"" + descriptor + "\" >\n";
        query += "  <set-property name=\"\"><![CDATA\[]]></set-property>\n";
        query += "</update-item>\n";
      }
      return query;
    },

    getQueryItemsQuery: function() {
      var descriptor = $("#itemDescriptor").val();
      var idOnly = $("#idOnly").prop('checked');
      var query = "<query-items item-descriptor=\"" + descriptor + "\" id-only=\"" + idOnly + "\">\n\n";
      query += "</query-items>\n";
      return query;
    },

    getAllItemQuery: function() {
      var descriptor = $("#itemDescriptor").val();
      var idOnly = $("#idOnly").prop('checked');
      var query = "<query-items item-descriptor=\"" + descriptor + "\" id-only=\"" + idOnly + "\">\n";
      query += "ALL\n";
      query += "</query-items>\n";
      return query;
    },

    getLast10ItemQueryOrdered: function() {
      var descriptor = $("#itemDescriptor").val();
      var idOnly = $("#idOnly").prop('checked');
      var query = "<query-items item-descriptor=\"" + descriptor + "\" id-only=\"" + idOnly + "\">\n";
      query += "ALL ORDER BY ID DESC RANGE 0+10\n";
      query += "</query-items>\n";
      return query;
    },


    getLast10ItemQuery: function() {
      var descriptor = $("#itemDescriptor").val();
      var idOnly = $("#idOnly").prop('checked');
      var query = "<query-items item-descriptor=\"" + descriptor + "\" id-only=\"" + idOnly + "\">\n";
      query += "ALL RANGE 0+10\n";
      query += "</query-items>\n";
      return query;
    },

    getRQLQuery: function() {
      var query = "";
      var action = $("#RQLAction").val();
      logTrace("getRQLQuery : " + action);
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
      else if (action == "last_10_ordered")
        query = BDA_REPOSITORY.getLast10ItemQueryOrdered();
      else if (action == "last_10")
        query = BDA_REPOSITORY.getLast10ItemQuery();
      return query;
    },
    submitRQLQuery: function(addText) {
      if (addText) {
        var query = BDA_REPOSITORY.getRQLQuery();
        BDA_REPOSITORY.setQueryEditorValue(BDA_REPOSITORY.getQueryEditorValue() + query);
      }
      BDA_REPOSITORY.sanitizeQuery();
      BDA_STORAGE.storeSplitValue();
      // set anchor to the result div
      location.hash = '#RQLResults';
      $("#RQLForm").submit();
    },

    sanitizeQuery: function() {
      var query = BDA_REPOSITORY.getQueryEditorValue();
      BDA_REPOSITORY.setQueryEditorValue(query.replace(/repository\=\".+\"/gi, ""));
    },

    setQueryEditorValue: function(value) {
      BDA_REPOSITORY.queryEditor.getDoc().setValue(value);
    },

    getQueryEditorValue: function() {
      return BDA_REPOSITORY.queryEditor.getDoc().getValue();
    },

    showTextField: function(baseId) {
      baseId = BDA_REPOSITORY.sanitizeSelector(baseId);
      $("#" + baseId).toggle();
      $("#text_" + baseId).toggle();
    },

    // Escape '.', ':' in a jquery selector
    sanitizeSelector: function(id) {
      return id.replace(/(:|\.|\[|\]|,)/g, "\\$1");
    },

    purgeXml: function(xmlContent) {
      var xmlStr = "";
      var lines = xmlContent.split("\n");
      for (var i = 0; i != lines.length; i++) {
        var line = lines[i].trim();
        if (!(line.substr(0, 1) == "<" && endsWith(line, ">")))
          xmlStr += line + "\n";
      }
      return xmlStr;
    },


    // Check if the given property contains id(s) with the given item descriptor
    // Return an item descriptor name if the property is an ID,
    // Return null if the property is not found,
    // Return "FOUND_NOT_ID" is the property is found but is not an ID
    isPropertyId: function(propertyName, $itemDesc) {
      var isId = null;
      var propertyFound = false;
      $itemDesc.find("property[name=" + propertyName + "]").each(function() {
        propertyFound = true;
        var $property = $(this);
        if ($property.attr("item-type") !== undefined && $property.attr("repository") === undefined)
          isId = $property.attr("item-type");
        else if ($property.attr("component-item-type") !== undefined && $property.attr("repository") === undefined)
          isId = $property.attr("component-item-type");
      });
      if (propertyFound && isId === null)
        return "FOUND_NOT_ID";
      return isId;
    },
    // Check if the given property contains id(s) with the given repository definition
    // Only ID from the current repository are take in account
    // Return the item descriptor name if the type if an ID, null otherwise
    isTypeId: function(propertyName, itemDesc, $xmlDef) {
      var isId = null;
      if ($xmlDef !== null) {
        var $itemDesc = $xmlDef.find("item-descriptor[name='" + itemDesc + "']");
        // First check in current item desc
        isId = BDA_REPOSITORY.isPropertyId(propertyName, $itemDesc);
        // In case we found the property but it's not an ID, we don't want to search in super-type
        if (isId == "FOUND_NOT_ID")
          return null;
        // In case we found the property and it's an ID
        if (isId !== null)
          return isId;
        // Now we check in each super-type item desc
        var superType = $itemDesc.attr("super-type");
        while (superType !== undefined && isId === null) {
          var $parentDesc = $xmlDef.find("item-descriptor[name='" + superType + "']");
          isId = BDA_REPOSITORY.isPropertyId(propertyName, $parentDesc);
          superType = $parentDesc.attr("super-type");
        }
        if (isId == "FOUND_NOT_ID")
          return null;
      }
      return isId;
    },

    // Parse the given repository ID into a tab, each index will contains an ID or a separator : "," or "="
    parseRepositoryId: function(id) {
      var idAsTab = [];
      var tab = [];
      // Case of simple ID
      if (id.indexOf(BDA_REPOSITORY.MAP_SEPARATOR) == -1 && id.indexOf(BDA_REPOSITORY.LIST_SEPARATOR) === -1)
        idAsTab.push(id);
      // Case of a list of ID
      else if (id.indexOf(BDA_REPOSITORY.MAP_SEPARATOR) == -1 && id.indexOf(BDA_REPOSITORY.LIST_SEPARATOR) !== -1) {
        tab = id.split(BDA_REPOSITORY.LIST_SEPARATOR);
        for (var i = 0; i != tab.length; i++) {
          if (i !== 0)
            idAsTab.push(BDA_REPOSITORY.LIST_SEPARATOR);
          idAsTab.push(tab[i]);
        }
      }
      // Case of a Map of ID
      else {
        var mapEntries = id.split(BDA_REPOSITORY.LIST_SEPARATOR);
        for (var a = 0; a != mapEntries.length; a++) {
          if (a !== 0)
            idAsTab.push(BDA_REPOSITORY.LIST_SEPARATOR);
          var mapValues = mapEntries[a].split(BDA_REPOSITORY.MAP_SEPARATOR);
          for (var b = 0; b != mapValues.length; b++) {
            if (b !== 0)
              idAsTab.push(BDA_REPOSITORY.MAP_SEPARATOR);
            idAsTab.push(mapValues[b]);
          }
        }
      }
      return idAsTab;
    },

    buildItemDescriptor: function(itemDescriptorName, $xmlDef, repository) {
      BDA_REPOSITORY.PERF_MONITOR.start('buildItemDescriptor');
      //  console.time(itemDescriptorName);
      var $itemDefinition = $xmlDef.find('item-descriptor[name={0}]'.format(itemDescriptorName));

      // first get properties from the parent, if it exists
      var superType = $itemDefinition.attr("super-type");
      let parent = null;
      if (!_.isNil(superType)) {
        parent = repository.getItemDescriptor(superType); //this will build parents by recursion if necessary
      }
      let propertyDescriptors = {};
      if (!_.isNil(parent)) {
        propertyDescriptors = parent.properties;
      }

      // then add current properties
      var $properties = $itemDefinition.find('property');

      var selfPropertyDescriptors = {};
      $properties.each(function() {
        let $prop = $(this);
        let name = $prop.attr('name');
        let propDesc = new PropertyDescriptor($prop, repository);
        let defaultValue = $prop.attr('default');
        if (!_.isNil(defaultValue)) {
          propDesc.defaultValue = defaultValue;
        }
        selfPropertyDescriptors[name] = propDesc;
      });

      propertyDescriptors = _.merge(propertyDescriptors, selfPropertyDescriptors);
      propertyDescriptors = _.sortKeysBy(propertyDescriptors);

      let desc = new ItemDescriptor({
        name: itemDescriptorName,
        xmlDefinition: $itemDefinition,
        properties: propertyDescriptors
      });
      //  console.timeEnd(itemDescriptorName);
      BDA_REPOSITORY.PERF_MONITOR.cumul('buildItemDescriptor');
      return desc;
    },

    getRepositoryAsync: function(path, callback) {
      logTrace('getRepositoryAsync', path);
      let repository = BDA_REPOSITORY.repositories[path];
      if (_.isNil(repository)) {
        processRepositoryXmlDef("definitionFiles",
          ($xmlDef) => {

            repository = BDA_REPOSITORY.getRepository($xmlDef, path);
            callback(repository);
          }, path)

      } else {
        callback(repository)
      }
    },

    getRepository: function($xmlDef, repositoryPath) {
      logTrace('getRepository', repositoryPath);
      let repository = BDA_REPOSITORY.repositories[repositoryPath];
      if (_.isNil(repository)) {
        repository = new Repository({
          path: repositoryPath,
          xmlDefinition: $xmlDef
        })
        BDA_REPOSITORY.repositories[repositoryPath] = repository;
      }
      return repository;
    },

    sleepFor: function(sleepDuration) {
      var now = new Date().getTime();
      while (new Date().getTime() < now + sleepDuration) { /* do nothing */ }
    },

    showXMLAsTab: function(rawXml, $xmlDef, $outputDiv, isItemTree, loadSubItemCb, repositoryPath) {
      let xmlContent = sanitizeXml(rawXml);


      console.time('showXMLAsTab_new');
      if (_.isEmpty(repositoryPath)) {
        repositoryPath = getCurrentComponentPath();
      }
      let repository = BDA_REPOSITORY.getRepository($xmlDef, repositoryPath);
      let parsedResult = BDA_REPOSITORY.parseXmlResult(xmlContent, repository, rawXml);

      let items = parsedResult.items;
      let logs = parsedResult.logs;



      BDA_REPOSITORY.initProgress(items.length, $outputDiv);

      BDA_REPOSITORY.renderResultSection(items, repository, $outputDiv, isItemTree);

      BDA_REPOSITORY.createSpeedbar_new($outputDiv);

      BDA_REPOSITORY.hideProgressBar($outputDiv);

      BDA_REPOSITORY.PERF_MONITOR.log();
      console.timeEnd('showXMLAsTab_new');
      return logs;
    },

    renderResultSection: function(items, repository, $outputDiv, isItemTree) {
      console.time('renderResultSection');
      // now render the result section
      $outputDiv.append("<div class='prop_attr prop_attr_red'>R</div> : read-only " +
        "<div class='prop_attr prop_attr_green'>D</div> : derived " +
        "<div class='prop_attr prop_attr_blue'>E</div> : export is false," +
        '&nbsp;<i class="fa fa-external-link-square" aria-hidden="true"></i> : Link to other Repository,' +
        '&nbsp;<span class="default">grey</span> : default value');

      // show all button
      let showAll = $('<button>Show All <i class="fa fa-expand" aria-hidden="true"></i></button>');
      let hideAll = $('<button>Collapse All <i class="fa fa-compress" aria-hidden="true"></i></button>');

      showAll.on('click', function() {
        $('.property')
          .removeClass('show-short')
          .addClass('show-long');
        $(this).hide();
        hideAll.show();
      })

      hideAll.on('click', function() {
        $('.property')
          .addClass('show-short')
          .removeClass('show-long');
        $(this).hide();
        showAll.show();
      }).hide();


      $outputDiv.append($('<p id="resultToolbar"></p>').append(showAll).append(hideAll));



      BDA_REPOSITORY.formatTabResult(repository, items, $outputDiv);
      console.timeEnd('renderResultSection');

    },

    parseXhrResult: function(xhrResult, repositoryPath, callback) {

      BDA_REPOSITORY.getRepositoryAsync(repositoryPath, (repository) => {
        try {
          logTrace('parseXhrResult', repositoryPath, xhrResult);
          var rawXml = $('<div>' + xhrResult + '</div>').find(BDA_REPOSITORY.resultsSelector).next().text().trim();
          let xmlContent = sanitizeXml(rawXml);
          let result = BDA_REPOSITORY.parseXmlResult(xmlContent, repository, rawXml);
          result.repository = repository;
          logTrace('parseXhrResult result:', result);
          callback(result);
        } catch (e) {
          console.error(e);
        }
      })

    },

    parseXmlResult: function(xmlContent, repository, rawXml) {
      console.time('parseXmlResult');
      try {

        var xmlDoc = $.parseXML("<xml>" + xmlContent + "</xml>");
        var $xml = $(xmlDoc);
        var rawXmlDoc = $($.parseXML("<xml>" + rawXml + "</xml>"));
        var $addItems = $xml.find("add-item");
        let items = BDA_REPOSITORY.parseXmlAsObjects($addItems, repository, rawXmlDoc);
        let logs = BDA_REPOSITORY.getExecutionLogs(xmlContent);
        console.timeEnd('parseXmlResult');
        return {
          items: items,
          logs: logs
        }
      } catch (e) {
        console.error(e);
        console.timeEnd('parseXmlResult');
      }

    },
    getExecutionLogs: function(xmlContent) {
      var log = $("<xml>" + xmlContent + "</xml>")
        .children()
        .remove()
        .end()
        .text()
        .trim();
      return log;
    },

    getChunkSize: function() {
      let chunkSize = 1;
      var splitObj = BDA_STORAGE.getStoredSplitObj();
      // activeSplit == don't split - don't ask me why this name...
      if (_.isNil(splitObj) || !!splitObj.activeSplit) {
        chunkSize = Number.MAX_SAFE_INTEGER;
      } else {
        chunkSize = parseInt(splitObj.splitValue);
      }
      if (chunkSize < 1) {
        chunkSize = 1; // safety
      }
      return chunkSize;
    },

    formatTabResult: function(repository, repositoryItems, result) {
      console.time('formatTabResult');
      try {
        let itemsByType = _.groupBy(repositoryItems, repoItem => !_.isNil(repoItem.itemDescriptor) ? repoItem.itemDescriptor.name : null);
        let nbItemDescriptors = _.keys(itemsByType).length;
        let res = $(BDA_REPOSITORY.templates.resultHeader.format(repositoryItems.length, nbItemDescriptors))

        var chunkSize = BDA_REPOSITORY.getChunkSize();

        // for each property, only display it if it'si not empty in one result
        let renderContext = {}
        _(itemsByType)
          .each((items, itemDescName) => {
            let desc = repository.getItemDescriptor(itemDescName);
            renderContext[itemDescName] = {};
            _.each(desc.properties, property => {
              try {
                renderContext[itemDescName][property.name] = _.some(items, item => item.hasValueFor(property.name));

              } catch (e) {
                console.err('error finding render context for: itemDescName,items, property', itemDescName, items, property);
              }
            })
          });


        // for each group of item by descriptor, split in chunks of same descriptor and max size 'chunkSize'
        let chunks = _(itemsByType)
          .map(group => _.chunk(group, chunkSize)) //split each group
          .flatMap() //flatten the array of arrays
          .value();


        //now render each tab
        let firstResult = _.chain(chunks)
          .map(chunk => {
            let tab = BDA_REPOSITORY.buildResultTable(chunk, renderContext, repository);
            BDA_REPOSITORY.updateProgress(chunk.length, result);
            return tab;
          })
          .filter(table => !_.isNil(table))
          .map(table => {
            table.appendTo(result);
            return table;
          })
          .head().value();

        return firstResult;

      } catch (e) {
        console.error(e);
      }
      console.timeEnd('formatTabResult');
    },

    parseXmlAsObjects: function($addItems, repository, rawXmlDoc) {
      BDA_REPOSITORY.PERF_MONITOR.start('parseXmlAsObjects');
      let res = $addItems.map(function() {
        var currentItem = $(this);
        var descriptorName = currentItem.attr("item-descriptor");
        var id = currentItem.attr("id");
        let itemDescriptor = repository.getItemDescriptor(descriptorName);
        let rawXml;
        if (!_.isNil(rawXmlDoc)) {
          rawXml = rawXmlDoc.find('add-item[item-descriptor="{0}"][id="{1}"]'.format(descriptorName, id));
        }
        let repositoryItem = new RepositoryItem({
          itemDescriptor: itemDescriptor,
          id: id,
          xmlDefinition: currentItem,
          rawXml: rawXml.outerHTML()
        })

        currentItem.find('set-property').each(function() {
          let currentProperty = $(this);
          let propertyName = currentProperty.attr('name');
          let propertyDescriptor;
          if (!_.isNil(itemDescriptor)) {
            propertyDescriptor = itemDescriptor.properties[propertyName];
          }
          let val = repositoryItem.values[propertyName];
          if (_.isNil(val)) {
            val = new PropertyValue(propertyDescriptor, currentProperty);
            repositoryItem.values[propertyName] = val;
          } else {
            val.setValueFromXml(currentProperty);
          }
        })
        logTrace('repoItem', repositoryItem);
        return repositoryItem;
      });
      BDA_REPOSITORY.PERF_MONITOR.cumul('parseXmlAsObjects');
      return res;
    },

    showNonEmptyLines: function(resultTable) {
      resultTable.find('.item-line.hidden').each(function() {
        let line = $(this);
        let mustShow = _.some(line.find('.propertyValue').get(),
          (elem) => !_.isEmpty($(elem).attr('data-raw'))
        );
        if (mustShow) {
          line.removeClass('hidden');
        }
      })
    },

    buildResultTable: function(items, renderContext, repo) {
      console.time('buildResultTable')
      let res;
      if (!_.isNil(items) && items.length > 0) {
        let itemDescriptor = items[0].itemDescriptor;
        let itemDescriptorName = itemDescriptor ? itemDescriptor.name : '';
        let table = $(BDA_REPOSITORY.templates.resultTable.format(itemDescriptorName, repo.path));
        let tableHead = $('<thead></thead>').appendTo(table);

        let idLine = $('<tr class="id even"><th>{0}</th></tr>'.format(itemDescriptorName)).appendTo(tableHead);
        _(items)
          .map(item => $(BDA_REPOSITORY.templates.idCell.format(item.id, itemDescriptorName, repo.path)).data('repositoryItem', item))
          .each((elem) => {
            elem.appendTo(idLine)
          });


        // let descLineElems = _(items).map((item) => BDA_REPOSITORY.templates.descriptorCell.format(itemDescriptorName, item.id)).join('');
        // let descLine = $('<tr class="descriptor odd"><th>descriptor</th>{0}</tr>'.format(descLineElems)).appendTo(tableHead);

        let tbody = $('<tbody></tbody>').appendTo(table);
        //for each property, get 
        let index = 1;
        console.time('build all items');
        _(itemDescriptor.properties)
          .each((property) => {

            // hiden lines that have all null values
            let lineIsVisible = !!renderContext[itemDescriptor.name][property.name]

            let line = $('<tr class="item-line {0} {1}" data-property="{2}"></tr>'.format(getEvenOddClass(index), lineIsVisible ? '' : 'hidden', property.name));

            //build property name cell
            // the following flags have been set on the repoItem level :

            let propertyNameCell = $('<th>{0}<span class="prop_name"></span></th>'.format(property.name)).appendTo(line);

            let sampleItem = null

            if (lineIsVisible) {
              sampleItem = _.find(items, item => !_.isNil(item.values[property.name]));
              index++;
            }


            if (lineIsVisible && !_.isNil(sampleItem)) {
              let sampleValue = sampleItem.values[property.name];
              if (!!sampleValue.derived) {
                propertyNameCell.append('<div class="prop_attr prop_attr_green">D</div>');
                line.addClass('derived');
              }
              if (!!sampleValue.rdonly) {
                propertyNameCell.append('<div class="prop_attr prop_attr_red">R</div>');
                line.addClass('rdonly');
              }
              if (!!sampleValue.exportable) {
                propertyNameCell.append('<div class="prop_attr prop_attr_blue">E</div>');
                line.addClass('exportable');
              }
              if (property.isItem && !property.isItemOfSameRepository) {
                propertyNameCell.append('&nbsp;<i class="fa fa-external-link-square" aria-hidden="true"></i>');
                line.addClass('other-repository');
              }
            }

            // add all cells
            //   console.time('build all cells');
            let cellsAsString = _.map(items, item => BDA_REPOSITORY.buildPropertyValueCell(item, property, sampleItem, repo, lineIsVisible));
            // console.timeEnd('build all cells');
            //console.time('append all cells');

            $(cellsAsString.join()).appendTo(line);
            // _.each(cells, cell => cell.appendTo(line));

            //   console.timeEnd('append all cells');
            line.appendTo(tbody);

          });

        //enable local collapse/expand
        console.time('bind actions');
        table
          .on('click', '.actions .collapse', function() {
            $(this).closest('.property').addClass('show-short').removeClass('show-long');
          })
          .on('click', '.actions .expand', function() {
            $(this).closest('.property').removeClass('show-short').addClass('show-long');
          })
          .on('click', '.actions .start-edit', function() {
            BDA_REPOSITORY.onEdit($(this));

          })
          .on('click', '.id .reload-item', function() {
            BDA_REPOSITORY.onReload(this);
          })
          .on('click', '.id .copy-xml', function() {
            copyToClipboard($(this).closest('.property').data('repositoryItem').rawXml);
          })
          .on('click', '.id .close-elem', function() {
            logTrace('close-elem', $(this));
            BDA_REPOSITORY.closeTab($(this).closest('.property'));
          })
          .on('click', '.loadable_property', function() {
            BDA_REPOSITORY.onClickOnLoadSubItem($(this));
          })
        table.find('[data-toggle="tooltip"]').tooltip();
        console.timeEnd('bind actions');

        console.timeEnd('build all items');
        res = table;


      }
      console.timeEnd('buildResultTable')
      return res;
    },

    buildPropertyValueCell: function(item, property, referencePropertyValue, repository, lineIsVisible) {
      BDA_REPOSITORY.PERF_MONITOR.start('buildPropertyValueCell');

      // get the value from the repoItem
      BDA_REPOSITORY.PERF_MONITOR.start('buildPropertyValueCell.extractValue');
      let propertyValue = item.values[property.name];
      logTrace('buildPropertyValueCell : propertyValue', propertyValue);
      let val;
      try {
        val = propertyValue.value;
      } catch (e) {
        val = '';
      }
      BDA_REPOSITORY.PERF_MONITOR.cumul('buildPropertyValueCell.extractValue');

      // if the property is an item, build links
      BDA_REPOSITORY.PERF_MONITOR.start('buildPropertyValueCell.displayedVal');
      let displayedVal;
      if (lineIsVisible && property.isItem) {

        displayedVal = BDA_REPOSITORY.buildLinkToOtherItem(val, property);

      } else {
        displayedVal = val;
      }
      BDA_REPOSITORY.PERF_MONITOR.cumul('buildPropertyValueCell.displayedVal');


      // now if the property is very long, create a trunctated version
      BDA_REPOSITORY.PERF_MONITOR.start('buildPropertyValueCell.innerVal');
      let innerVal;
      let long = false;
      if (val.length <= BDA_REPOSITORY.CELL_MAX_LENGTH) {
        innerVal = BDA_REPOSITORY.templates.shortPropertyCell.format(val, displayedVal);
      } else {
        long = true;
        let short = val.substr(0, BDA_REPOSITORY.CELL_MAX_LENGTH) + ' ...';
        innerVal = BDA_REPOSITORY.templates.longPropertyCell.format(short, val, displayedVal);
      }
      BDA_REPOSITORY.PERF_MONITOR.cumul('buildPropertyValueCell.innerVal');


      // finally build the cell
      BDA_REPOSITORY.PERF_MONITOR.start('buildPropertyValueCell.formatCell');
      let resAsString = BDA_REPOSITORY.templates.propertyCell.format(
        innerVal,
        item.id,
        property.name,
        long ? 'toggable' : '',
        (propertyValue && propertyValue.isDefault) ? 'default' : '',
        displayedVal);

      BDA_REPOSITORY.PERF_MONITOR.cumul('buildPropertyValueCell.formatCell');

      BDA_REPOSITORY.PERF_MONITOR.cumul('buildPropertyValueCell');

      return resAsString;
    },

    onReload: function(elem) {
      console.log('reloadItem')
      let $this = $(elem);
      let property = $this.closest('.property');
      let id = property.attr('data-id');
      let item = property.attr('data-item');
      let repoPath = property.attr('data-repository');
      let parentTab = $this.closest('.dataTable');
      $this.addClass('fa-spin');
      BDA_REPOSITORY.reloadTab(id, item, repoPath, parentTab, () => {
        $this.removeClass('fa-spin');
        $.notify(
          "Success: Reloaded {0} {1}".format(item, id), {
            className: "success",
            position: "top center",
            autoHideDelay: 3000
          }
        );

      });
    },

    onEdit: function($this) {
      logInfo('click on start edit');

      let propertyElem = $this.closest('.property');


      if (_.isNil(propertyElem.attr('data-form-generated'))) {

        try {

          let dataTable = propertyElem.closest('.dataTable');
          let line = propertyElem.closest('.item-line')

          let itemName = dataTable.attr('data-descriptor');
          let repositoryPath = dataTable.attr('data-repository');

          let itemId = propertyElem.attr('data-id');
          let propertyName = propertyElem.attr('data-property');


          let val = propertyElem.find('.propertyValue').attr('data-raw');


          BDA_REPOSITORY.addInlineEditForm(propertyElem, val, propertyName, itemName, itemId, repositoryPath);
          propertyElem.attr('data-form-generated', true);

        } catch (e) {
          console.error(e);
        }


      }

      propertyElem.addClass('show-edit').find('.inline-input').focus();
    },

    buildLinkToOtherItem: function(val, property) {
      BDA_REPOSITORY.PERF_MONITOR.start('buildPropertyValueCell.buildLinkToOtherItem');

      let res = "";
      // handle map types
      let ids = _(val)
        .split(',')
        .map(sPair => _.split(sPair, '='))
        .map(pairArray => {
          if (pairArray.length >= 2) {
            return {
              id: pairArray[1].trim(),
              key: pairArray[0].trim()
            }
          } else if (pairArray.length == 1) {
            return {
              id: pairArray[0].trim()
            }
          } else {
            return null;
          }

        })
        .filter(elem => !_.isNil(elem))
        .value();


      _(ids)
        .map(elem => {
          let cell = '<span class="clickable_property loadable_property {1}" data-samerepo="{2}" data-id="{3}" data-item-desc="{4}" data-repository="{5}">{0}</span>'
            .format(elem.id, property.isItemOfSameRepository ? '' : 'newpage', property.isItemOfSameRepository, elem.id, property.itemType, property.itemRepository)

          return {
            key: elem.key,
            cell: cell
          }

        })
        .each((elem, idx) => {
          if (!_.isNil(elem.key)) {
            res += '{0} = '.format(elem.key);
          }
          res += elem.cell
          if (idx < ids.length - 1) {
            res += ' , ';
          }
        });
      BDA_REPOSITORY.PERF_MONITOR.cumul('buildPropertyValueCell.buildLinkToOtherItem');
      return res;
    },

    onClickOnLoadSubItem: function(elem) {
      let $this = $(elem);
      let property = $this.closest('.property');

      let isItemOfSameRepository = $this.attr('data-samerepo') === 'true'; //data is saved as string

      let itemId = $this.attr('data-id');
      let itemType = $this.attr('data-item-desc');
      let repositoryPath = $this.attr('data-repository');

      if (isItemOfSameRepository) {
        try {
          //find the item if same id
          // load the result in the parent section (repo/itemtree/dashscreen)
          let outputDiv = $this.closest('.rqlResultContainer');
          let selector = '.idCell[data-id="{0}"]'.format(itemId);
          let resultTable = outputDiv.find(selector);
          // if the result already exists, just scroll to it
          if (resultTable.length > 0) {
            $(window).scrollTo(resultTable, 500);
            resultTable.find('[data-id="{0}"]'.format(itemId)).flash(); //flash the whole tab
          } else {
            property.addClass('loading');
            let endLoadingFc = () => {
              property.removeClass('loading');
            };
            BDA_REPOSITORY.loadSubItem(itemId, itemType, repositoryPath, outputDiv, null, null, endLoadingFc);
          }
        } catch (e) {
          console.error(e)
        }

      } else {
        //create a form that will post to a new tab
        try {

          var xmlText = BDA_REPOSITORY.templates.printItem.format(itemType, itemId);
          let form = $('<form  action="/dyn/admin/nucleus{0}/" method="POST" target="_blank"><textarea name="xmltext" ></textarea><input value="Enter" type="submit"></form>'.format(repositoryPath));
          form
            .appendTo('body')
            .find('textarea')
            .val(xmlText)
            .end()
            .submit()
            .remove();

        } catch (e) {
          console.error(e);
        }
      }
    },

    addInlineEditFormFromObjects: function(output, val, property, item, repository) {
      BDA_REPOSITORY.addInlineEditForm(output, val, property.name, item.id, repository.path);
    },

    addInlineEditForm: function(output, val, propertyName, itemName, itemId, repositoryPath) {
      BDA_REPOSITORY.PERF_MONITOR.start('addInlineEditForm');
      logInfo('addInlineEditForm', arguments);
      try {

        let form = $('<form class="edit"></form>');
        let input = $('<textarea class="inline-input" rows="1"></input>').val(val);
        input.appendTo(form);
        input.on('blur', function() {

          try {

            let newVal = input.val();
            if (newVal === val) {
              input.closest('.property').removeClass('show-edit');
              return; // exit if no change
            }
            var xmlText = BDA_REPOSITORY.templates.editProperty.format(itemName, itemId, propertyName, newVal);
            let highlighted = $('<div class="xml"><pre><code></code></pre></div>');
            highlighted.find('code').text(xmlText);
            highlighted.each(function(i, block) {
              hljs.highlightBlock(block);
            })

            $('body').bdaAlert({
              msg: 'You are about to execute this query : \n {0}'.format(highlighted.html()),
              options: [{
                label: 'Confirm',
                _callback: function() {
                  BDA_REPOSITORY.executeQuery('', xmlText, repositoryPath,
                    (result) => {
                      try {
                        var xmlContent = $('<div>' + result + '</div>').find(BDA_REPOSITORY.resultsSelector).next().text().trim();
                        let logs = BDA_REPOSITORY.getExecutionLogs(xmlContent);

                        let parentTab = input.closest('.dataTable');
                        BDA_REPOSITORY.reloadTab(itemId, itemName, repositoryPath, parentTab, () => {

                          $.notify(
                            "Success: \n{0}".format(logs), {
                              className: "success",
                              position: "top center",
                              autoHideDelay: 5000

                            }
                          );

                        });

                      } catch (e) {
                        console.error(e);
                      }

                    },
                    (jqXHR, textStatus, errorThrown) => {
                      $.notify(
                        "Error during call: {0}.".format(errorThrown), {
                          className: "error",
                          position: "top center",
                          autoHide: false
                        }
                      );
                    });
                }
              }, {
                label: 'Cancel'
              }]
            });
          } catch (e) {
            console.error(e);
          }

        })
        output.append(form);
      } catch (e) {
        console.error(e);
      }
      BDA_REPOSITORY.PERF_MONITOR.cumul('addInlineEditForm');

    },
    closeTab: function(idCell, container) {
      try {
        logTrace('closetab', idCell);
        let tab = idCell.closest('.dataTable');
        tab.find('[data-id="{0}"]'.format(idCell.attr('data-id'))).remove();
        //if last item remove tab
        let tabSize = tab.find('.idCell').length;
        let container = tab.closest('.rqlResultContainer');
        BDA_REPOSITORY.reloadSpeedBar(container);
        if (tabSize == 0) {
          tab.remove();
        }
      } catch (e) {
        console.error(e);
      }

    },

    findTabToAppendTo: function(itemDescriptorName, outputDiv) {
      let dataTables = outputDiv.find('.dataTable[data-descriptor="{0}"]'.format(itemDescriptorName));
      var max = BDA_REPOSITORY.getChunkSize();
      let res;
      logTrace('dataTables', dataTables);
      dataTables.each(function(idx, table) {
        let $table = $(table);
        logTrace('table', $table);
        if ($table.find('.idCell').length < max) {
          res = $table;
        }
      })
      return res;
    },

    appendToDataTable: function(id, itemDescriptorName, repositoryPath, dataTable, tempResult, cb) {
      let propertySelector = '.property[data-id="{0}"]'.format(id);
      tempResult.find(propertySelector).each(function() {
        let $this = $(this);
        let propertyName = $this.attr('data-property');
        dataTable.find('.item-line[data-property="{0}"]'.format(propertyName)).append($this);
      })

      //  update the data
      let idSelector = '.idCell[data-id="{0}"]'.format(id, itemDescriptorName);
      dataTable.find('tr.id').append(tempResult.find(idSelector));
      BDA_REPOSITORY.showNonEmptyLines(dataTable);
      if (cb) {
        cb();
      }
    },

    reloadTab: function(id, itemDescriptorName, repositoryPath, parentTab, cb) {
      if (_.isNil(repositoryPath)) {
        repositoryPath = getCurrentComponentPath();
      }
      BDA_REPOSITORY.executePrintItem('', itemDescriptorName, id, repositoryPath,
        function(result) {
          BDA_REPOSITORY.parseXhrResult(result, repositoryPath, (parsed) => {

            try {

              let tempResult = $('<div></div>');
              BDA_REPOSITORY.formatTabResult(parsed.repository, parsed.items, tempResult);

              let propertySelector = '.property[data-id="{0}"]'.format(id);
              tempResult.find(propertySelector).each(function() {
                let $this = $(this);
                let propertyName = $this.attr('data-property');
                parentTab.find(propertySelector + '[data-property="{0}"]'.format(propertyName)).replaceWith(this);
              })

              //  update the data
              let idSelector = '.idCell[data-identifier="id_{0}_{1}"]'.format(id, itemDescriptorName);
              parentTab.find(idSelector).replaceWith(tempResult.find(idSelector));

              parentTab.find('[data-id="{0}"]'.format(id)).flash();

              BDA_REPOSITORY.showNonEmptyLines(parentTab);

              if (cb) {
                cb();
              }
            } catch (e) {
              console.error(e);
            }

          })
        },

        function(jqXHR, textStatus, errorThrown) {
          $.notify(
            "Error during call: " + errorThrown + ".", {
              className: "error",
              position: "top center"
            }
          );

        })
    },

    // load sub item with an ajax call
    loadSubItem: function(id, itemDescriptorName, repositoryPath, $outputDiv, cbSuccess, cbErr, cbEnd) {
      if (_.isNil(repositoryPath)) {
        repositoryPath = getCurrentComponentPath();
      }

      // : function(domain, itemDescriptor, id, repository, callback, errCallback) {
      BDA_REPOSITORY.executePrintItem('', itemDescriptorName, id, repositoryPath,
        function(result) {
          BDA_REPOSITORY.parseXhrResult(result, repositoryPath, (parsed) => {

            let temp = $('<div></div>');

            let top = BDA_REPOSITORY.formatTabResult(parsed.repository, parsed.items, temp);
            //use the itemDescriptor from the result, not the query (ex payment group vs creditCard)

            let resultDescriptorName = _.first(parsed.items).itemDescriptor.name;
            let targetTab = BDA_REPOSITORY.findTabToAppendTo(resultDescriptorName, $outputDiv);
            if (_.isNil(targetTab) || targetTab.length === 0) {
              temp.children().appendTo($outputDiv);
            } else {
              BDA_REPOSITORY.appendToDataTable(id, resultDescriptorName, repositoryPath, targetTab, temp);
              top = targetTab;
            }

            BDA_REPOSITORY.reloadSpeedBar($outputDiv);
            if (top) {
              $(window).scrollTo(top, 500);
              top.find('[data-id="{0}"]'.format(id)).flash();
            }
            if (cbSuccess) {
              cbSuccess();
            }
            if (cbEnd) {
              cbEnd();
            }
          });
        },
        function(jqXHR, textStatus, errorThrown) {
          $.notify(
            "Error during call: " + errorThrown + ".", {
              className: "error",
              position: "top center"
            }
          );
          if (cbErr) {
            cbErr();
          }
          if (cbEnd) {
            cbEnd();
          }
        }
      )
    },



    showLoadSubItemAlert: function() {
      logTrace('click on loadable');
      var $elm = $(this);
      var id = $elm.attr("data-id");
      var itemDesc = $elm.attr("data-descriptor");
      var query = "<print-item id='" + id + "' item-descriptor='" + itemDesc + "' />\n";

      $('body').bdaAlert({
        msg: 'You are about to add this query and reload the page: \n' + query,
        options: [{
          label: 'Add & Reload',
          _callback: function() {
            BDA_REPOSITORY.setQueryEditorValue(BDA_REPOSITORY.getQueryEditorValue() + query);
            $("#RQLForm").submit();
          }
        }, {
          label: 'Just Add',
          _callback: function() {
            BDA_REPOSITORY.setQueryEditorValue(BDA_REPOSITORY.getQueryEditorValue() + query);
          }
        }, {
          label: 'Cancel'
        }]
      });
    },

    showRQLLog: function(log, error) {
      logTrace("Execution log : " + log);
      if (log && log.length > 0) {
        $("<h3>Execution log</h3><div id='RQLLog'></div>").insertAfter("#RQLResults");
        var cleanLog = log.replace(/\n{2,}/g, '\n').replace(/------ /g, "").trim();
        $("#RQLLog").html(cleanLog);
      }
      if (error)
        $("#RQLLog").addClass("error");
    },

    showRQLResults: function() {
      logTrace("Start showRQLResults");
      // Add 'show raw xml' link
      var html = "<p>" + "<a href='javascript:void(0)' id='rawXmlLink'>Show raw xml</a>" + "</p>\n";
      html += "<p id='rawXml'></p>";

      let resultsBlock = $("#RQLResults");

      resultsBlock.addClass('rqlResultContainer').append(html);

      var xmlContent = $(BDA_REPOSITORY.resultsSelector).next().text().trim();
      // xmlContent = sanitizeXml(xmlContent); //sanitize later

      BDA_REPOSITORY.PERF_MONITOR.reset();
      BDA_REPOSITORY.PERF_MONITOR.start('processRepositoryXmlDef');

      //build a status bar
      let statusBar = $(BDA_REPOSITORY.templates.progressBar.format(0, 0));
      resultsBlock.append(statusBar);
      // BDA_REPOSITORY.initProgress(100, resultsBlock);

      // setTimeout(function() {
      //   BDA_REPOSITORY.updateProgress(66, resultsBlock);
      // }, 2000);

      processRepositoryXmlDef("definitionFiles", function($xmlDef) {
        BDA_REPOSITORY.PERF_MONITOR.cumul('processRepositoryXmlDef');
        var log = BDA_REPOSITORY.showXMLAsTab(xmlContent, $xmlDef, resultsBlock, false);
        BDA_REPOSITORY.showRQLLog(log, false);
        // Move raw xml
        $(BDA_REPOSITORY.resultsSelector).next().appendTo("#rawXml");
        $(BDA_REPOSITORY.resultsSelector).remove();

        $("#rawXmlLink").click(function() {
          BDA_REPOSITORY.toggleRawXml();
          var xmlSize = $("#rawXml pre").html().length;
          logTrace("raw XML size : " + xmlSize);
          logTrace("XML max size : " + BDA_REPOSITORY.xmlDefinitionMaxSize);
          if (xmlSize < BDA_REPOSITORY.xmlDefinitionMaxSize) {
            $('#rawXml').each(function(i, block) {
              hljs.highlightBlock(block);
            });
          } else {
            // Check if button already exists
            if ($("#xmlHighlight").length === 0) {
              $("<p id='xmlHighlight' />")
                .html("The XML result is big, to avoid slowing down the page, XML highlight have been disabled. " + "<br> <button id='xmlHighlightBtn'>Highlight XML now</button> <small>(takes few seconds)</small>")
                .prependTo($("#rawXml"));
              $("#xmlHighlightBtn").click(function() {
                $('#rawXml pre').each(function(i, block) {
                  hljs.highlightBlock(block);
                });
              });
            }
          }
        });
      });
    },

    showRqlErrors: function() {
      var error = "";
      if ($(BDA_REPOSITORY.errorsSelector1).length > 0) {
        logTrace("Case of error  : 1");
        error = $(BDA_REPOSITORY.errorsSelector1).next().text();
        $(BDA_REPOSITORY.resultsSelector).next().remove();
        $(BDA_REPOSITORY.resultsSelector).remove();
        $(BDA_REPOSITORY.errorsSelector1).next().remove();
        $(BDA_REPOSITORY.errorsSelector1).remove();
      } else {
        logTrace("Case of error  : 2");
        error = $(BDA_REPOSITORY.errorsSelector2).text();
      }
      error = BDA_REPOSITORY.purgeXml(error);
      BDA_REPOSITORY.showRQLLog(error, true);
    },

    escapeHTML: function(s) {
      return String(s).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    propertiesDef: function(hljs) {
      logTrace("propertiesDef");
      return {
        case_insensitive: true,
        contains: [{
          className: 'comment',
          begin: '#',
          end: '$'
        }, {
          className: 'setting',
          begin: '^[a-z0-9\\[\\]_-]+[ \\t]*=[ \\t]*',
          end: '$',
          contains: [{
            className: 'value',
            endsWithParent: true,
            keywords: 'on off true false yes no',
            contains: [hljs.QUOTE_STRING_MODE, hljs.NUMBER_MODE],
            relevance: 0
          }]
        }]
      };
    },

    //--- Item Tree functions ------------------------------------------------------------------------

    setupItemTreeForm: function() {
      $("<div id='itemTree' />").insertAfter("#RQLEditor");
      var $itemTree = $("#itemTree");
      $itemTree.append("<h2>Get Item Tree</h2>");
      $itemTree.append("<p>This tool will recursively retrieve items and print the result with the chosen output." + "<br> For example, if you give an order ID in the form below, you will get all shipping groups, payment groups, commerceItems, priceInfo... of the given order" + "<br><b> Be careful when using this tool on a live instance ! Set a low max items value.</b></p>");

      $itemTree.append("<div id='itemTreeForm'>" + "id : <input type='text' id='itemTreeId' /> &nbsp;" + "descriptor :  <span id='itemTreeDescriptorField' ><select id='itemTreeDesc' class='itemDescriptor' >" + BDA_REPOSITORY.getDescriptorOptions() + "</select></span>" + "max items : <input type='text' id='itemTreeMax' value='50' /> &nbsp;<br><br>" + "output format :  <select id='itemTreeOutput'>" + "<option value='HTMLtab'>HTML tab</option>" + "<option value='addItem'>add-item XML</option>" + "<option value='removeItem'>remove-item XML</option>" + "<option value='printItem'>print-item XML</option>" + "<option value='tree'>Tree (experimental)</option>" + "</select>&nbsp;" + "<input type='checkbox' id='printRepositoryAttr' /><label for='printRepositoryAttr'>Print attribute : </label>" + "<pre style='margin:0; display:inline;'>repository='" + getCurrentComponentPath() + "'</pre> <br><br>" + "<button id='itemTreeBtn'>Enter <i class='fa fa-play fa-x'></i></button>" + "</div>");
      $itemTree.append("<div id='itemTreeInfo' />");
      $itemTree.append("<div id='itemTreeResult' class='rqlResultContainer' />");
      $("#itemTreeBtn").click(function() {
        var descriptor = $("#itemTreeDesc").val();
        var id = $("#itemTreeId").val().trim();
        var maxItem = parseInt($("#itemTreeMax").val());
        var outputType = $("#itemTreeOutput").val();
        var printRepoAttr = $("#printRepositoryAttr").is(':checked');
        logTrace("max item : " + maxItem);
        BDA_REPOSITORY.getItemTree(id, descriptor, maxItem, outputType, printRepoAttr);
      });

    },

    getSubItems: function(items, $xmlDef, maxItem, outputType, printRepoAttr) {
      var nbItem = BDA_REPOSITORY.itemTree.size;
      logTrace("maxItem : " + maxItem + ", nbItem : " + nbItem);

      // Ensure that getSubItems is not call more than maxItem times
      if (nbItem >= maxItem) {
        logTrace("max Item (" + maxItem + ") reached, stopping recursion");
        return;
      }

      var xmlText = "";
      for (var batchSize = 0; batchSize != items.length; batchSize++) {
        // Don"t ask for more items than limit
        if ((BDA_REPOSITORY.nbItemReceived + batchSize) >= maxItem)
          break;
        xmlText += "<print-item id='" + items[batchSize].id + "' item-descriptor='" + items[batchSize].desc + "' />\n";
      }
      logTrace(xmlText);
      logTrace("batch size : " + batchSize);
      // Only request if the batchSize contains something
      if (batchSize > 0) {
        $.ajax({
          type: "POST",
          url: document.URL,
          data: {
            xmltext: xmlText
          },
          success: function(result, status, jqXHR) {

            var rawItemsXml = $(result).find("code").html();
            // remove first 2 lines
            var tab = rawItemsXml.split("\n");
            tab.splice(0, 2);
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
              if (BDA_REPOSITORY.itemTree.get(itemId) === undefined) {
                var rawItemXml = $itemXml[0].outerHTML;
                BDA_REPOSITORY.itemTree.set(itemId, rawItemXml);
                var descriptor = $itemXml.attr("item-descriptor");
                var $itemDesc = $xmlDef.find("item-descriptor[name=" + descriptor + "]");
                var superType = $itemDesc.attr("super-type");
                while (superType !== undefined) {
                  var $parentDesc = $xmlDef.find("item-descriptor[name=" + $itemDesc.attr("super-type") + "]");
                  $itemDesc = $itemDesc.add($parentDesc);
                  superType = $parentDesc.attr("super-type");
                }
                // One to One relation
                $itemDesc.find('property[item-type]')
                  .each(function(index, elm) {
                    var $elm = $(elm);
                    var subProperty = $elm.attr("name");
                    var subId = $itemXml.find("set-property[name=" + subProperty + "]").text();
                    if ($elm.attr("repository") === undefined && subId.length > 0) {
                      // avoid infinite recursion
                      if (BDA_REPOSITORY.itemTree.get(subId) === undefined) {
                        subItems.push({
                          'id': subId,
                          'desc': $elm.attr("item-type")
                        });
                      }
                    }
                  });

                // One to Many relation with list, array or map
                $itemDesc.find('property[component-item-type]')
                  .each(function(index, elm) {
                    var $elm = $(elm);
                    var subProperty = $elm.attr("name");
                    var subId = $itemXml.find("set-property[name=" + subProperty + "]").text();
                    if ($elm.attr("repository") === undefined && subId.length > 0) {
                      var desc = $elm.attr("component-item-type");
                      var ids = BDA_REPOSITORY.parseRepositoryId(subId);
                      for (var i = 0; i != ids.length; i++) {
                        // avoid infinite recursion
                        if (ids[i] !== BDA_REPOSITORY.MAP_SEPARATOR && ids[i] !== BDA_REPOSITORY.LIST_SEPARATOR && BDA_REPOSITORY.itemTree.get(ids[i]) === undefined)
                          subItems.push({
                            'id': ids[i],
                            'desc': desc
                          });
                      }
                    }
                  });
              }
            });

            logTrace(subItems.length + " items to retrieved in next request. Limit reach : " + (BDA_REPOSITORY.nbItemReceived >= maxItem));
            if (subItems.length > 0 && BDA_REPOSITORY.nbItemReceived < maxItem)
              BDA_REPOSITORY.getSubItems(subItems, $xmlDef, maxItem, outputType, printRepoAttr);
            else
              BDA_REPOSITORY.renderItemTreeTab(outputType, printRepoAttr, $xmlDef, maxItem);
          },
        });
      } else
        logTrace("Request is empty, nothing to do.");
    },

    getItemTree: function(id, descriptor, maxItem, outputType, printRepoAttr) {
      logTrace("getItemTree - start");
      // reset divs
      $("#itemTreeResult").empty();
      $("#itemTreeInfo").empty();

      if (!id) {
        $("#itemTreeInfo").html("<p>Please provide a valid ID</p>");
        return;
      }

      console.time("getItemTree");
      console.time("retrieveItem");
      // Get XML definition of the repository
      $("#itemTreeInfo").html("<p>Getting XML definition of this repository...</p>");
      var $xmlDef = processRepositoryXmlDef("definitionFiles", function($xmlDef) {
        if (!$xmlDef) {
          $("#itemTreeInfo").html("<p>Unable to parse XML definition of this repository !</p>");
          return;
        }
        logTrace("descriptor : " + $xmlDef.find("item-descriptor").length);
        // get tree
        BDA_REPOSITORY.itemTree = new Map();
        BDA_REPOSITORY.nbItemReceived = 0;
        BDA_REPOSITORY.getSubItems([{
          'id': id,
          'desc': descriptor
        }], $xmlDef, maxItem, outputType, printRepoAttr);
      });
    },

    renderItemTreeTab: function(outputType, printRepoAttr, $xmlDef, maxItem) {
      console.timeEnd("retrieveItem");
      logTrace("Render item tree tab : " + outputType);

      //  If the max item is reached before recursion ended, we notify the user
      if (BDA_REPOSITORY.nbItemReceived >= maxItem) {
        $.notify(
          "Item tree stopped because the maximum items limit was reached : " + maxItem + ".", {
            className: "warn",
            position: "top center"
          }
        );
      }

      $("#itemTreeInfo").empty();
      $("#itemTreeResult").empty();
      var res = "";
      if (outputType !== "HTMLtab" && outputType != "tree") {
        logTrace("Render copy button");
        $("#itemTreeInfo").append("<input type='button' id='itemTreeCopyButton' value='Copy result to clipboard'></input>");
        $('#itemTreeCopyButton').click(function() {
          copyToClipboard($('#itemTreeResult').text());
        });
      }
      if (outputType == "addItem") {
        BDA_REPOSITORY.itemTree.forEach(function(data, id) {
          if (printRepoAttr) {
            var xmlDoc = jQuery.parseXML(data);
            var $itemXml = $(xmlDoc).find("add-item");
            $itemXml.attr("repository", getCurrentComponentPath());
            res += $itemXml[0].outerHTML;
          } else
            res += data;
          res += "\n\n";
        }, BDA_REPOSITORY.itemTree);
        res = "<import-items>\n" + res + "\n</import-items>";
        $("#itemTreeResult").append("<pre />");
        $("#itemTreeResult pre").text(res);
      } else if (outputType == "HTMLtab") {
        BDA_REPOSITORY.itemTree.forEach(function(data, id) {
          res += data;
        }, BDA_REPOSITORY.itemTree);
        BDA_REPOSITORY.showXMLAsTab(res, $xmlDef, $("#itemTreeResult"), true);
      } else if (outputType == "removeItem" || outputType == "printItem") {
        BDA_REPOSITORY.itemTree.forEach(function(data, id) {
          var xmlDoc = jQuery.parseXML(data);
          var $itemXml = $(xmlDoc).find("add-item");
          res += "<";
          if (outputType == "removeItem")
            res += "remove-item";
          else
            res += "print-item";
          res += ' id="' + $itemXml.attr("id") + '" item-descriptor="' + $itemXml.attr("item-descriptor") + "\"";
          if (printRepoAttr)
            res += " repository='" + getCurrentComponentPath() + "'";
          res += ' />\n';
        }, BDA_REPOSITORY.itemTree);

        $("#itemTreeResult").append("<pre />");
        $("#itemTreeResult pre").text(res);
      } else if (outputType == "tree") {
        BDA_REPOSITORY.renderAsTree($xmlDef);
      }

      console.timeEnd("getItemTree");
    },

    renderAsTree: function($xmlDef) {
      logTrace("render as tree");
      console.time('renderAsTree.setup');
      var nodes = new vis.DataSet();
      var edges = new vis.DataSet();
      var legends = new Map();
      var descById = new Map();
      var itemIdToVisId = {};
      var i = 0;
      BDA_REPOSITORY.itemTree.forEach(function(data, id) {
        itemIdToVisId[id] = i;
        i++;
      });

      BDA_REPOSITORY.itemTree.forEach(function(data, id) {
        var xmlDoc = $.parseXML("<xml>" + data + "</xml>");
        var $xml = $(xmlDoc);
        var $addItem = $xml.find("add-item").first();
        var itemDesc = $addItem.attr("item-descriptor");
        var itemId = $addItem.attr("id");

        $addItem.children().each(function(index) {
          var $this = $(this);
          var propertyName = $this.attr("name");
          var propertyValue = $this.text();
          if (BDA_REPOSITORY.edgesToIgnore.indexOf(propertyName) === -1) {
            var isId = BDA_REPOSITORY.isTypeId(propertyName, itemDesc, $xmlDef)
            if (isId != null && isId != "FOUND_NOT_ID") {
              var idAsTab = BDA_REPOSITORY.parseRepositoryId(propertyValue);
              for (var i = 0; i != idAsTab.length; i++) {
                if (idAsTab[i] != "," && idAsTab[i] != "=") {
                  edges.add({
                    from: itemIdToVisId[itemId],
                    to: itemIdToVisId[idAsTab[i]],
                    arrows: 'to',
                    title: propertyName
                  });
                }
              }
            }
          }
        });

        var nodeColor = colorToCss(stringToColour(itemDesc));
        nodes.add({
          id: itemIdToVisId[itemId],
          label: itemDesc + "\n" + itemId,
          color: nodeColor,
          shape: 'box'
        });
        legends.set(itemDesc, nodeColor);

        if (descById.get(itemDesc))
          descById.get(itemDesc).push(itemId);
        else
          descById.set(itemDesc, [itemId]);
      });
      console.timeEnd('renderAsTree.setup');
      // Create popup
      $("#itemTreeResult").empty()
        .append("<div class='popup_block' id='treePopup'>" + "<div><a href='javascript:void(0)' class='close'><i class='fa fa-times'></i></a></div>" + "<div id='treeLegend'></div>" + "<div class='flexContainer'>" + "<div id='treeInfo'></div>" + "<div id='treeContainer'></div>" + "</div>" + "</div>");
      $("#treePopup .close").click(function() {
        logTrace("click on close");
        $("#treePopup").hide();
      });

      // Setup legend
      legends.forEach(function(value, key) {
        $("#treeLegend").append("<div class='legend' style='background-color:" + value + "' id='" + key + "'>" + key + "</div>");
      });

      logTrace("Number for nodes : " + nodes.length);
      logTrace("Number for edges : " + edges.length);

      $("#treePopup").show();
      console.time('renderAsTree.render');

      // Create the network
      var data = {
        nodes: nodes,
        edges: edges
      };

      var options = {
        physics: {
          stabilization: false
        },
        edges: {
          smooth: true
        },
        nodes: {
          font: {
            color: "#FFFFFF"
          }
        }
      };

      var container = document.getElementById('treeContainer');
      var network = new vis.Network(container, data, options);
      console.timeEnd('renderAsTree.render')

      network.on("click", function(params) {
        params.event = "[original event]";
        if (params.nodes && params.nodes.length == 1) {
          $("#treeInfo").empty();
          var visId = params.nodes[0];
          var itemId = null;
          logTrace("Click on " + visId);
          // Find itemId from visID
          for (var id in itemIdToVisId) {
            if (visId === itemIdToVisId[id]) {
              itemId = id;
              break;
            }
          }
          logTrace("itemId : " + itemId);
          logTrace(BDA_REPOSITORY.itemTree.get(itemId));
          BDA_REPOSITORY.showXMLAsTab(BDA_REPOSITORY.itemTree.get(itemId), null, $("#treeInfo"), false);
          logTrace($("#treeInfo").html());
          $("#treeInfo").show();
        }
      });

      $(".legend").click(function() {
        // This feature is disabled for now.
        return;
        logTrace("click on legend");
        var id = $(this).attr('id');
        logTrace(id);
        var ids = descById.get(id);
        var nodesAndEdgesToHide = {};
        for (var i = 0; i != ids.length; i++) {
          nodesAndEdgesToHide = BDA_REPOSITORY.findNodesAndEdgesToHide(ids[i], network, edges, nodes);

          // Foreach nodesAndEdgesToHide.nodes
          for (var a = 0; a != nodesAndEdgesToHide.nodes.length; a++) {
            nodes.update([{
              id: nodesAndEdgesToHide.nodes[a],
              hidden: true
            }]);
          }
          // Foreach nodesAndEdgesToHide.edges
          for (var a = 0; a != nodesAndEdgesToHide.edges.length; a++) {
            edges.update([{
              id: nodesAndEdgesToHide.edges[a],
              hidden: true
            }]);
          }
        }
      });
    },

    findNodesAndEdgesToHide: function(id, network, edges, nodes) {
      logTrace("findNodesAndEdgesToHide for ID : " + id);
      var nodesAndEdgesToHide = {};
      nodesAndEdgesToHide.nodes = BDA_REPOSITORY.findOrphanSon(id, network, edges, nodes, [id]);
      nodesAndEdgesToHide.edges = [];
      for (var i = 0; i != nodesAndEdgesToHide.nodes.length; i++) {
        nodesAndEdgesToHide.edges = nodesAndEdgesToHide.edges.concat(network.getConnectedEdges(nodesAndEdgesToHide.nodes[i]));
      }
      logTrace("nodesAndEdgesToHide.nodes : ");
      logTrace(nodesAndEdgesToHide.nodes);
      logTrace("nodesAndEdgesToHide.edges : ");
      logTrace(nodesAndEdgesToHide.edges);
      return nodesAndEdgesToHide;
    },

    findOrphanSon: function(id, network, edges, nodes, orphanSons) {
      logTrace("About to find orphan for node : " + id);
      edges.forEach(function(elm) {
        //logTrace(elm);
        if (elm.from == id) {
          var isOrphan = true;
          var connectedEdges = network.getConnectedEdges(elm.to);

          for (var i = 0; i != connectedEdges.length; i++) {
            var edge = edges.get(connectedEdges[i]);
            logTrace("connectedEdge - from : " + edge.to + " - " + edge.from);
            if (edge.to == elm.to && edge.from != id) {
              isOrphan = false;
              break;
            }
          }
          if (isOrphan && orphanSons.indexOf(elm.to) === -1) {
            logTrace(elm.to + " is a new orphan son of node : " + id);
            orphanSons.push(elm.to);
            BDA_REPOSITORY.findOrphanSon(elm.to, network, edges, nodes, orphanSons);
          }
        }
      });
      return orphanSons;
    },


    createSpeedbar_new: function(resultElem) {
      logTrace('createSpeedbar_new')
      try {



        let speedbar = $('<div class="speedbar"><div class="widget"><i class="fa fa-times close"></i><p>Quick links :</p><ul></ul></div></div>');
        speedbar.find('.close').on('click', () => {
          speedbar.fadeOut(200);
        })

        let list = speedbar.find('ul');
        let dataTable = resultElem.find(".dataTable");
        dataTable.each(function(index) {
          var $tab = $(this);
          var id = $tab.attr("id");
          var descriptor = $tab.attr('data-descriptor');

          var nbItem = $tab.find("td").length / $tab.find("tr").length;
          let elem = $("<li><i class='fa fa-arrow-right'></i>&nbsp;&nbsp;<span class='clickable_property'>" + descriptor + "</span> (" + nbItem + ")</li>");
          elem.on('click', () => $(window).scrollTo($tab, 500));
          list.append(elem);
        });


        let button = $('<button class="showSpeedbar">Show Quick Links <i class="fa fa-bars" aria-hidden="true"></i></button>')
          .on('click', () => resultElem.find('.speedbar').fadeIn(200));

        resultElem.find('#resultToolbar').append(button);
        speedbar.prependTo(resultElem);

        let container = $(resultElem);

        let widget = speedbar.find('.widget');
        let initialTop = container.offset().top;
        var initialBot = initialTop + container.height();
        $(window).scroll(function() {
          var windowTop = $(window).scrollTop();
          if (initialTop < windowTop && initialBot > windowTop) {
            widget.addClass('sticky-top-100');
          } else {
            widget.removeClass('sticky-top-100');
          }
        });



      } catch (e) {
        console.error(e);
      }

    },

    reloadSpeedBar: function(resultElem) {
      resultElem.find('.speedbar').remove();
      resultElem.find('.showSpeedbar').remove();
      BDA_REPOSITORY.createSpeedbar_new(resultElem);
    },

    createSpeedbar: function() {
      var speedBarHtml = "<a class='close' href='javascript:void(0)'><i class='fa fa-times'></i></a><p>Quick links :</p><ul>";
      $("#itemTreeResult .dataTable").each(function(index) {
        var $tab = $(this);
        var id = $tab.attr("id");
        var name = id;
        if (id.indexOf("_") != -1) {
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
      $(window).scroll(function() { // scroll event
        var windowTop = $(window).scrollTop();
        if (stickyTop < windowTop)
          $('.sticky').css({
            position: 'fixed',
            top: 100
          });
        else
          $('.sticky').css('position', 'static');
      });
    },

    hideProgressBar: function(parent) {
      logTrace('hideProgressBar', arguments)
      let bar = $(parent).find('.progress');
      bar.hide();
    },

    initProgress: function(total, parent) {
      logTrace('initProgress', arguments)
      let wrapper = $(parent).find('.progress');
      wrapper.show();
      let bar = wrapper.find('.progress-bar');
      bar.attr('data-total', total)
        .attr('data-current', 0)
        .html('Loading {0} items'.format(total))
        .width('0%');
    },

    updateProgress: function(size, parent) {
      logTrace('updateProgress', arguments)
      let bar = $(parent).find('.progress-bar');
      let total = parseInt(bar.attr('data-total'));
      let current = parseInt(bar.attr('data-current'));
      current += size;
      bar.attr('data-current', current)
      let percentage = Math.floor(current / total * 100);
      bar.width(percentage + '%')
        .html('Loading {0}/{1} items'.format(current, total))
        .show();
      //.redraw();
    },


    showQueryList: function() {
      var html = "";
      // fix delete query : the index used to delete was not correct
      // we need to keep original index
      var rqlQueries = BDA_STORAGE.getStoredRQLQueries();
      var currComponentName = getComponentNameFromPath(getCurrentComponentPath());
      var nbQuery = 0;
      if (rqlQueries && rqlQueries.length > 0) {
        html += "<ul>";
        for (var i = 0; i != rqlQueries.length; i++) {
          var storeQuery = rqlQueries[i];
          if (!storeQuery.hasOwnProperty("repo") || storeQuery.repo == currComponentName) {
            var escapedQuery = $("<div>").text(storeQuery.query).html();
            html += "<li class='savedQuery'>";
            html += "<a class='savedQuery clickable_property' data-query='" + storeQuery.name + "'>" + storeQuery.name + "</a>";
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
            nbQuery++;
          }
        }
        html += "</ul>";
        if (nbQuery > 0)
          $("#storedQueries").html(html);
      }

      // $('#storedQueries .queryView').each(function(i, block) {
      //   hljs.highlightBlock(block);
      // });

      $("a.savedQuery").on('click', function() {
        let queryName = $(this).attr('data-query');
        logTrace("click on query : " + queryName);
        BDA_REPOSITORY.printStoredQuery(queryName);
      });

      $(".previewQuery").on('click', function() {

        try {


          let block = $(this).parent("li").find("span.queryView").each(function(i, block) {
            hljs.highlightBlock(block);
          });

          $('body').bdaAlert({
            msg: block.html(),
            width: '900px',
            options: [{
              label: 'OK'
            }]
          });
        } catch (e) {
          console.error(e);
        }


      });

      $(".deleteQuery")
        .click(function() {
          var index = this.id.replace("deleteQuery", "");
          logTrace("Delete query #" + index);
          logTrace(BDA_STORAGE.deleteRQLQuery);
          BDA_STORAGE.deleteRQLQuery(index);
          BDA_REPOSITORY.reloadQueryList();
        });
    },

    purgeRQLQuery: function(rqlQueries) {
      // Purge query
      var purgedRqlQueries = [];
      for (var i = 0; i != rqlQueries.length; i++) {
        var query = rqlQueries[i];
        if (!query.hasOwnProperty("repo") || query.repo == getComponentNameFromPath(getCurrentComponentPath())) {
          purgedRqlQueries.push(rqlQueries[i]);
        }
      }
      return purgedRqlQueries;
    },

    reloadQueryList: function() {
      $("#storedQueries").empty();
      BDA_REPOSITORY.showQueryList();
    },

    printStoredQuery: function(name) {
      logTrace("printStoredQuery : " + name);
      var rqlQueries = BDA_STORAGE.getStoredRQLQueries();
      logTrace(rqlQueries);
      if (rqlQueries) {
        for (var i = 0; i != rqlQueries.length; i++) {
          if (rqlQueries[i].name == name)
            BDA_REPOSITORY.setQueryEditorValue(rqlQueries[i].query + "\n");
        }
      }
    },

    getToggleLabel: function(state) {
      if (state == 1)
        return "Show less...";
      return "Show more...";
    },

    toggleShowLabel: function(contentDisplay, selector) {
      if (contentDisplay == "none")
        $(selector).html("Show more...");
      else
        $(selector).html("Show less...");
    },

    toggleCacheUsage: function() {
      var $cacheUsage = $(BDA_REPOSITORY.cacheUsageSelector);
      $cacheUsage.next().toggle().next().toggle();
      BDA_REPOSITORY.toggleShowLabel($cacheUsage.next().css("display"), "#showMoreCacheUsage");
      BDA_STORAGE.storeToggleState("showMoreCacheUsage", $cacheUsage.next().css("display"));
    },

    toggleRepositoryView: function() {
      $(BDA_REPOSITORY.repositoryViewSelector).next().toggle().next().toggle();
      BDA_REPOSITORY.toggleShowLabel($(BDA_REPOSITORY.repositoryViewSelector).next().css("display"), "#showMoreRepositoryView");
      BDA_STORAGE.storeToggleState("showMoreRepositoryView", $(BDA_REPOSITORY.repositoryViewSelector).next().css("display"));
    },

    toggleProperties: function() {
      $(BDA_REPOSITORY.propertiesSelector).next().toggle();
      BDA_REPOSITORY.toggleShowLabel($(BDA_REPOSITORY.propertiesSelector).next().css("display"), "#showMoreProperties");
      BDA_STORAGE.storeToggleState("showMoreProperties", $(BDA_REPOSITORY.propertiesSelector).next().css("display"));
    },

    toggleEventSets: function() {
      $(BDA_REPOSITORY.eventSetsSelector).next().toggle();
      BDA_REPOSITORY.toggleShowLabel($(BDA_REPOSITORY.eventSetsSelector).next().css("display"), "#showMoreEventsSets");
      BDA_STORAGE.storeToggleState("showMoreEventsSets", $(BDA_REPOSITORY.eventSetsSelector).next().css("display"));
    },

    toggleMethods: function() {
      $(BDA_REPOSITORY.methodsSelector).next().toggle();
      BDA_REPOSITORY.toggleShowLabel($(BDA_REPOSITORY.methodsSelector).next().css("display"), "#showMoreMethods");
      BDA_STORAGE.storeToggleState("showMoreMethods", $(BDA_REPOSITORY.methodsSelector).next().css("display"));
    },

    toggleRawXml: function() {
      $("#rawXml").toggle();
      if ($("#rawXml").css("display") == "none")
        $("#rawXmlLink").html("show raw XML");
      else
        $("#rawXmlLink").html("hide raw XML");
    },

    // simply handles an ajax call to a repository and parse the result
    // xmltext : full xml text
    // repository : only the strict nucleus path
    // callback : take 1 param :  object {item: array of add-items, head}
    executeQuery: function(domain, xmltext, repository, callback, errCallback) {

      if (isNull(domain)) {
        domain = "";
      }
      var url = '{0}/dyn/admin/nucleus/{1}/'.format(domain, repository);

      $.ajax({
        type: "POST",
        url: url,
        data: {
          xmltext: xmltext
        },
        success: function(result, status, jqXHR) {

          //check for errors
          try {

            let errors = BDA_REPOSITORY.getErrors(result);

            var rawItemsXml;

            if (_.isEmpty(errors)) {
              rawItemsXml = $(result).find("code").html();
              if (_.isEmpty(rawItemsXml)) {
                errors = "Null response";
              }
            }

            if (_.isEmpty(errors)) {
              callback(result);
            } else {
              errCallback(null, 'Execution Error', errors);
            }

          } catch (e) {
            console.error(e);
          }


        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (!isNull(errCallback)) {
            errCallback(jqXHR, textStatus, errorThrown);
          }
        }
      });
    },

    getErrors: function(res) {

      var $res = $(res);
      var errorsSelector1 = "Errors:";
      let errorMsg = null;
      if ($res.text().indexOf(errorsSelector1) != -1) {
        errorMsg = $res.find("code").text().trim();
      }

      return errorMsg;
    },

    executePrintItem: function(domain, itemDescriptor, id, repository, callback, errCallback) {
      var xmlText = BDA_REPOSITORY.templates.printItem.format(itemDescriptor, id);
      BDA_REPOSITORY.executeQuery(domain, xmlText, repository, callback, errCallback);
    },

    executeQueryItems: function(domain, itemDescriptor, query, repository, callback, errCallback) {
      var xmlText = BDA_REPOSITORY.templates.queryItems.format(itemDescriptor, query);
      BDA_REPOSITORY.executeQuery(domain, xmlText, repository, callback, errCallback);
    },

    previewRql: function(queryType, values) {
      let xmlText;
      switch (queryType) {
        case 'print':
          xmlText = BDA_REPOSITORY.templates.printItem.format(values.itemDescriptor, values.id);
          break;
        case 'query':
          xmlText = BDA_REPOSITORY.templates.queryItems.format(values.itemDescriptor, values.text);
          break;
        default:
          xmlText = values.text

      }
      return xmlText;
    },

    setupRepositoryCacheSection: function() {

      try {

        console.time("setupRepositoryCacheSection");

        //global css setups to aid further customisation
        var $cacheUsage = $(this.cacheUsageSelector);
        var $cacheTable = $cacheUsage.next().next().find('table');
        BDA_REPOSITORY.$cacheTable = $cacheTable;
        $cacheTable.addClass('cache').removeAttr('border'); //remove border - will be handled by css


        //move the header in a thead
        var $header = $cacheTable.find('tr').first();
        $header.detach();
        var $thead = $('<thead></thead>').prependTo($cacheTable).append($header);

        //mark the sub-headers
        var index = 0;
        $cacheTable.find('tr').each(function() {
          var $tr = $(this);
          //if header
          if ((index - 1) % 3 == 0) { //if sub-header
            //highlight per item
            $tr.addClass('odd cache-subheader');
          }
          index++;
        });
        var $tBody = $cacheTable.find('tbody:first');


        BDA_REPOSITORY.setupCacheCollapse($header, $cacheTable);


        //collapse all button
        var $resetLink = $cacheUsage.next();
        var $buttons = $('<div></div>').appendTo($resetLink);

        var $expandAll = $('<button></button>', {
            id: 'cacheExpandAll',
            class: ' cache expand',
            value: 'expandAll',
            html: 'Expand All'
          })
          .bind('click', function() {
            $cacheTable.find('tr.cache-subheader.collapsed').each(BDA_REPOSITORY.toggleCacheLines);
          })
          .appendTo($buttons);

        var $collapseAll = $('<button></button>', {
            id: 'collapseAll',
            class: 'cache collapse',
            value: 'collapseAll',
            html: 'Collapse All'
          })
          .on('click', function() {
            $cacheTable.find('tr.cache-subheader.expanded').each(BDA_REPOSITORY.toggleCacheLines);
          })
          .appendTo($buttons);

        $collapseAll = $('<button></button>', {
            id: 'exportCSV',
            class: 'cache export',
            value: 'exportCSV',
            html: 'Export as CSV'
          })
          .on('click', function() {
            BDA_REPOSITORY.exportCacheStatsAsCSV();
          })
          .appendTo($buttons);

        BDA_REPOSITORY.setupCacheTableHeaderFixed($header, $cacheTable);


        //collapse all (after setup fixed header because we need full width)
        $cacheTable.find('.cache-subheader').each(function() {
          $(this).addClass('collapsed')
            .next().css('display', 'none')
            .next().css('display', 'none');
        });

        console.timeEnd("setupRepositoryCacheSection");
      } catch (err) {
        console.error(err);
      }

    },

    setupCacheCollapse: function($header, $cacheTable) {

      var fullColSize = 23;
      if (BDA.isOldDynamo) {
        fullColSize = 18;

      }


      $cacheTable.find('.cache-subheader').each(function() {
        var $tr = $(this);

        //expand the cell width
        var $td = $tr.find('td').first();

        $td.attr('colspan', fullColSize); //extend to full with
        //query cache line
        var $queryCols = $tr.next().next().children('td');
        if ($queryCols.length == 1) {
          $queryCols.attr('colspan', fullColSize);
        }

        //enhance the title line
        var text = $td.find('b:contains("item-descriptor")').first().text();

        var match = BDA_REPOSITORY.CACHE_STAT_TITLE_REGEXP.exec(text);
        var newText = '';
        var itemDesc = '',
          cacheMode = '',
          cacheLocality = '';
        if (!isNull(match[1])) {
          itemDesc = match[1];
          newText += '<span> item-descriptor=<b>{0}</b>'.format(itemDesc);
        }
        if (!isNull(match[2])) {
          cacheMode = match[2];
          newText += '<span> cache-mode=<b>{0}</b>'.format(cacheMode);
        }
        if (!isNull(match[3])) {
          cacheLocality = match[3];
          newText += '<span> cache-locality=<b>{0}</b>'.format(cacheLocality);
        }

        //add as attr for easier handling
        $tr.attr('data-item-desc', itemDesc)
          .attr('data-cache-mode', cacheMode)
          .attr('data-cache-locality', cacheLocality);

        var $arrow = $('<span class="cacheArrow"><i class="up fa fa-arrow-right"></i></span>' + newText);
        $td.html($arrow);

        //collapse items
        $tr.bind('click', BDA_REPOSITORY.toggleCacheLines);



      });
    },

    setupCacheTableHeaderFixed: function($header, $cacheTable) {

      traceTime('setupCacheTableHeaderFixed')

      //make the header fixed with css
      $cacheTable.addClass('fixed_headers');
      logTrace('isOldDynamo ' + BDA.isOldDynamo)
      if (BDA.isOldDynamo) {
        $cacheTable.addClass('oldDynamo');
      }

      //clone the header

      var $copy = $header.clone().addClass('sticky-header-copy');
      $header.addClass('sticky-header-original');
      $copy.insertAfter($header).hide();

      var left = null;
      var setupDone = false;
      $(window).scroll(function() { // scroll event
        var $window = $(window);
        var windowTop = $$(window).scrollTop();
        //get the value now because it changes on show/hide/collapse
        var top = $cacheTable.offset().top;
        var bot = top + $cacheTable.height();

        try {

          if (top < windowTop && bot > windowTop) {
            $copy.addClass('sticky-top');
            var windowLeft = $window.scrollLeft();
            if (!setupDone) {
              left = $cacheTable.offset().left;
              BDA_REPOSITORY.setupCacheHeaderWidth($header, $copy);
              setupDone = true;
            }
            $copy.css('left', -windowLeft + left);
            $copy.show();
          } else {
            $copy.removeClass('sticky-top');
            $copy.css('left', 0);
            $copy.hide();
          }

        } catch (e) {
          console.error(e);
        }

      });
      traceTimeEnd('setupCacheTableHeaderFixed')

    },

    setupCacheHeaderWidth: function($header, $copy) {
      traceTime('setupCacheHeaderWidth.getWidth')
      //since we set all column with the same width we can use only the first cell as reference
      var w = $('th:first', $header).width() + "px"; // .width() is very slow :(
      //var w =first.width()
      traceTimeEnd('setupCacheHeaderWidth.getWidth')

      var $child;
      traceTime('setupCacheHeaderWidth.setFixedWidth')
      $copy.children('th').each(function(idx, child) {
        $child = $(child);
        $child.css({
          'max-width': w,
          'min-width': w,
        })
      });
      traceTimeEnd('setupCacheHeaderWidth.setFixedWidth')

    },

    toggleCacheLines: function() {
      var $tr = $(this);
      $tr.toggleClass('collapsed')
        .toggleClass('expanded');
      $tr.next().toggle();
      $tr.next().next().toggle();
      rotateArrowQuarter($tr.find('.cacheArrow i'));
    },

    exportCacheStatsAsCSV: function() {
      var data = [];
      var line, $tr, $dataTr;
      //header
      data.push([
        'Item Descriptor',
        'Cache Mode',
        'Cache locality',
        'type',
        'localEntries',
        'externEntries',
        'weakEntries',
        'localCacheSize',
        'usedRatio',
        'totalHits',
        'totalMisses',
        'ratio',
        'localHits',
        'localMisses',
        'externalHits',
        'externalMisses',
        'weakHits',
        'weakMisses',
        'cacheInvalidations',
        'entryInvalidations',
        'localCulls',
        'localItemsCulled',
        'localMaxCulled',
        'weakCulls',
        'weakItemsCulled',
        'weakMaxCulled'
      ]);

      BDA_REPOSITORY.$cacheTable.find('tr.cache-subheader').each(function(idx, elem) {
        $tr = $(elem);
        line = [];
        line.push($tr.attr('data-item-desc'));
        line.push($tr.attr('data-cache-mode'));
        line.push($tr.attr('data-cache-locality'));
        line.push('item-cache');

        $tr.next().children('td').each(function() {
          line.push($(this).text());
        });

        data.push(line);

        var $queryTr = $tr.next().next();
        var $cols = $queryTr.children('td');
        if ($cols.length > 1) {
          //query caching available
          line = [];
          line.push($tr.attr('data-item-desc'));
          line.push($tr.attr('data-cache-mode'));
          line.push($tr.attr('data-cache-locality'));
          line.push('query-cache');

          $cols.each(function() {
            line.push($(this).text());
          });
          data.push(line);
        }
      });

      var linesText = [];
      for (var i = 0; i < data.length; i++) {
        linesText.push(data[i].join(';'))
      }

      var csv = linesText.join('\n');

      copyToClipboard(csv);

    }
  };

  // Reference to BDA_STORAGE
  var BDA_STORAGE, BDA;

  // Jquery plugin creation
  $.fn.bdaRepository = function(theBDA) {
    logTrace('Init plugin {0}'.format('bdaRepository'));
    //settings = $.extend({}, defaults, options);
    BDA = theBDA;
    BDA_STORAGE = $.fn.bdaStorage.getBdaStorage();
    BDA_REPOSITORY.build();
    return this;
  };

  $.fn.bdaRepository.reloadQueryList = function() {
    if (BDA_REPOSITORY.isRepositoryPage)
      BDA_REPOSITORY.reloadQueryList();
  };

  $.fn.executePrintItem = function(domain, itemDescriptor, id, repository, callback, errCallback) {
    BDA_REPOSITORY.executePrintItem(domain, itemDescriptor, id, repository, callback, errCallback);
  };

  $.fn.executeQueryItems = function(domain, itemDescriptor, query, repository, callback, errCallback) {
    BDA_REPOSITORY.executeQueryItems(domain, itemDescriptor, query, repository, callback, errCallback);
  };

  $.fn.executeRql = function(domain, xmlText, repository, callback, errCallback) {
    BDA_REPOSITORY.executeQuery(domain, xmlText, repository, callback, errCallback);
  };

  $.fn.previewRql = function(queryType, values) {
    return BDA_REPOSITORY.previewRql(queryType, values);
  }

  $.fn.getBdaRepository = function() {
    return BDA_REPOSITORY;
  };

})(jQuery);