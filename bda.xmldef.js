(function($) {
  "use strict";
  var BDA_XML_DEF = {

    tableInitialized: false,
    isXMLDefinitionFilePage: false,
    xmlDefinitionMaxSize: 150000, // 150 Ko
    templates: {
      itemDescTable: '<div id="item_{0}" class="item-panel panel panel-default" data-item-descriptor="{0}">' +
        '<table class="table item-descriptor-table table-condensed " >' +
        '{1}' +
        '</table>' +
        '</div>',
      itemHeader: [ //other properties than name
        'sub-type-property',
        'super-type',
        'cache-mode',
        'item-cache-timeout',
        'item-cache-size'
      ],
      tableHeader: ['type', 'id-column-name', 'shared-table-sequence'],
      tableColumns: [{
        name: 'name',
        width: '15%'
      }, {
        name: 'data/item-type',
        build: function($prop) {
          var val;
          var dataType = $prop.attr('data-type');
          var itemType = val = $prop.attr('item-type');

          if (!isNull(dataType)) {
            val = dataType;
          } else if (!isNull(itemType)) {
            val = '<a href="#item_{0}">{0}</a>'.format(val);
          }

          var componentDataType = $prop.attr('component-data-type');
          var componentItemType = $prop.attr('component-item-type');
          var componentType;
          if (!isNull(componentDataType)) {
            componentType = componentDataType;
          } else if (!isNull(componentItemType)) {
            componentType = '<a href="#item_{0}">{0}</a>'.format(componentItemType);
          }

          if (!isNull(componentType)) {
            val = '{0} [<span class="component-data-type"> {1}</span> ]'.format(val, componentType);
          }

          var tooltip = "";
          var $opt;
          var enumClass = "";
          if ('enumerated' == dataType) {
            enumClass = "enum";
            var opts = ['<ul>'];
            $prop.find('option').each(function(idx, opt) {
              $opt = $(opt);
              opts.push('<li>{0} : {1}</li>'.format($opt.attr('value'), $opt.attr('code')));
            });
            opts.push('</ul>');
            var useCode = true;
            var $useCodeForValue = $prop.find('attribute[name=useCodeForValue]:first');
            if ($useCodeForValue.length > 0) {
              useCode = $useCodeForValue.attr('value') == 'true';
            }
            var popoverTitle = 'useCodeForValue : {0}'.format(useCode);
            tooltip = 'data-html="true" data-trigger="hover focus" data-toggle="popover" ' +
              'data-placement="top" data-content="{0}" data-title="{1}"'
              .format(opts.join(''), popoverTitle);
          }

          if (!isNull(val)) {
            val = '<span class="data-type {2}" {1}>{0}</span>'.format(val, tooltip, enumClass);
          }
          return val;
        }
      }, {
        name: 'column-name',
      }, {
        name: 'required',
      }, {
        name: 'property-type',
        build: function($prop) {
          var full = $prop.attr('property-type');
          var val;
          if (!isNull(full) && full !== "") {
            var slices = full.split('.');
            val = '<span class="property-type" data-toggle="tooltip" data-placement="top" title="{1}">{0}</span>'.format(slices[slices.length - 1], full);
          }

          return val;
        }
      }, {
        name: 'default',
      }, {
        name: 'cache-mode',
      }, {
        name: 'queryable'
      }],
      quickNavSearch: '<div class="input-group"><input id="xmlDefSearchBox" type="text" placeholder="Search : item, table, column..." class="form-control"/>' +
        ' <span class="input-group-btn">' +
        '<button id="clearQuickNavSearch" class="btn btn-default" type="button">x</button>' +
        '</span></div>',
      quickNavHeader: '<div class="panel-heading">' +
        ' <h3 class="panel-title pull-left">QuickNav</h3>' +
        '<button id="quickNavCollapse" class="btn btn-default pull-right">' +
        '<i class="fa fa-minus-square" aria-hidden="true"></i>' +
        '</button>' +
        '<button id="quickNavMoveTop" class="btn btn-default pull-right ">' +
        '<i class="fa fa-level-up" aria-hidden="true"></i>' +
        '</button>' +
        '<button id="quickNavMoveBot" class="btn btn-default pull-right">' +
        '<i class="fa fa-level-down" aria-hidden="true"></i>' +
        '</button>' +
        '<div class="clearfix"></div>' +
        '</div>',
    },


    build: function() {
      console.time("bdaXmlDef");
      BDA_XML_DEF.isXMLDefinitionFilePage = BDA_XML_DEF.isXMLDefinitionFilePageFct();

      if (BDA_XML_DEF.isXMLDefinitionFilePage)
        BDA_XML_DEF.setupXMLDefinitionFilePage();
      console.timeEnd("bdaXmlDef");
    },

    isXMLDefinitionFilePageFct: function() {
      return $("td:contains('class atg.xml.XMLFile')").length > 0 || $("td:contains('class [Latg.xml.XMLFile;')").length > 0;
    },

    setupXMLDefinitionFilePage: function() {

      BDA_XML_DEF.addDisplayXmlAsTableButton();

      var xmlSize = 0;
      $("pre").each(function(index) {
        xmlSize += $(this).html().length;
      });
      logTrace("Xml size : " + xmlSize);
      if (xmlSize < BDA_XML_DEF.xmlDefinitionMaxSize) {
        highlightAndIndentXml($("pre"));
      } else {
        $("<p />")
          .html("The definition file is big, to avoid slowing down the page, XML highlight and indentation have been disabled. <br>" + "<button id='xmlHighlightBtn'>Highlight and indent now</button> <small>(takes few seconds)</small>")
          .insertAfter($("h3:contains('Value')"));

        $("#xmlHighlightBtn").click(function() {
          highlightAndIndentXml($("pre"));
        });
      }


    },

    addDisplayXmlAsTableButton: function() {

      var tableSection = $('<p id="xmlDefAsTableSection"></p>')

      .insertAfter($("h3:contains('Value')"))
        .append($('<button id="showXmlAsTable" class="">Display as table</button>').on('click', BDA_XML_DEF.showXmlDefAsTable));

    },

    showXmlDefAsTable: function() {
      console.log('showXmlDefAsTable');
      if (!BDA_XML_DEF.tableInitialized) {
        BDA_XML_DEF.tableInitialized = true;
        BDA_XML_DEF.buildXmlDefAsTable();
      }
      $('#xmlDefAsTable').slideToggle({
        complete: function() {
          BDA_XML_DEF.resizeQuickNav();
        }
      });
    },

    //doesn't use processRepositoryXmlDef because no need for Ajax call
    //might need to refactor later for dual use.
    buildXmlDefAsTable: function() {

      try {

        var $wrapper = $('<div class="twbs"></div>');
        $('#xmlDefAsTableSection').append($wrapper);
        var $row = $('<div id="xmlDefAsTable" class="row" style="display:none;" ></div>');
        $wrapper.append($row);
        var $container = $('<div  id="definitionsContainer" class="container col-lg-10">');
        $row.append($container);
        BDA_XML_DEF.$xmlDefTable = $container;

        $('pre').each(function(idx, pre) {

          var escapeXML = $(pre).html();
          logTrace("xml: " + escapeXML);
          var unescapeXML = $('<div/>').html(escapeXML).text();
          //hack: if we keep table, jquery doesn't like it as it's not a proper html table
          unescapeXML = unescapeXML.replace(new RegExp(/table/, 'g'), 'div');

          var $xmlDef = $(unescapeXML);
          var $panel, $itemDesc, $table, caption, headerFields, attr, attrDef, rows, cols, $propertyDesc, val, itemDescName;

          var itemSize = {};

          $xmlDef.find('item-descriptor').each(function(idx, itemDesc) {
            $itemDesc = $(itemDesc);
            var subTables = [];
            itemDescName = $itemDesc.attr('name');
            itemSize[itemDescName] = 0;
            //header row
            rows = [];
            //header values:
            var itemHeader = BDA_XML_DEF.buildItemHeader($itemDesc);

            rows.push('<tr id="header_{1}" data-target="{1}" class="item-descriptor success open"><th>{1}<th colspan="{0}">{2}</th></tr>'.format(BDA_XML_DEF.templates.tableColumns.length - 1, itemDescName, itemHeader));
            //
            $itemDesc.find('div').each(function(idx, table) {
              $table = $(table);
              tableName = $table.attr('name');
              //table def
              rows.push(BDA_XML_DEF.buildTableHeader($table));

              rows.push(BDA_XML_DEF.buildSubTableHeader(tableName));

              //properties that are tables:
              $table.find('property').each(function(idx, propertyDesc) {
                  $propertyDesc = $(propertyDesc);
                  cols = [];
                  for (var i = 0; i < BDA_XML_DEF.templates.tableColumns.length; i++) {
                    attrDef = BDA_XML_DEF.templates.tableColumns[i];
                    if (!isNull(attrDef.build)) {
                      val = attrDef.build($propertyDesc);
                    } else {
                      val = $propertyDesc.attr(attrDef.name);
                    }
                    if (isNull(val)) {
                      val = "";
                    }
                    cols.push('<td>{0}</td>'.format(val));
                  }
                  rows.push('<tr class="property" data-table="tabledef_{1}">{0}</tr>'.format(cols.join(''), tableName));
                });
                //

            });

            if ($itemDesc.children('property').length > 0) {

              //non table properties (transient/dynamic)
              //headers
              var tableName = 'nontabledef_' + itemDescName;
              rows.push('<tr id="tabledef_{1}" class="table-def open"><th colspan="{0}">Non table properties</th></tr>'.format(BDA_XML_DEF.templates.tableColumns.length, tableName));
              rows.push(BDA_XML_DEF.buildSubTableHeader(tableName));

              $itemDesc.children('property').each(function(idx, propertyDesc) {
                  $propertyDesc = $(propertyDesc);
                  cols = [];
                  for (var i = 0; i < BDA_XML_DEF.templates.tableColumns.length; i++) {
                    attrDef = BDA_XML_DEF.templates.tableColumns[i];
                    if (!isNull(attrDef.build)) {
                      val = attrDef.build($propertyDesc);
                    } else {
                      val = $propertyDesc.attr(attrDef.name);
                    }
                    if (isNull(val)) {
                      val = "";
                    }
                    cols.push('<td>{0}</td>'.format(val));
                  }
                  rows.push('<tr class="property" data-table="tabledef_{1}">{0}</tr>'.format(cols.join(''), tableName));
                });
                //
            }

            $panel = $(
              BDA_XML_DEF.templates.itemDescTable.format(itemDescName, rows.join(''))
            );
            itemSize[itemDescName] = rows.length;
            // $panel.find('#header_'+itemDescName).prepend($(BDA_XML_DEF.templates.collapserColumn.format(rows.length,itemDescName)));

            $container.append($panel);


          });

        });

        BDA_XML_DEF.$ITEMS = $container.find('.panel');
        var searchTimeOut;

        $('.item-descriptor').on('click', function() {
          var $this = $(this);
          var target = $this.attr('data-target');
          if ($this.hasClass('open')) {
            $this.removeClass('open').addClass('closed');
            $('#item_' + target).find('tr')
              .filter(function() {
                return !$(this).hasClass('item-descriptor');
              })
              .hide();
          } else {
            $this.removeClass('closed').addClass('open');
            $('#item_' + target).find('tr').show();
          }
        });

        $('.table-def').on('click', function() {
          var $this = $(this);
          var id = $this.attr('id');
          if ($this.hasClass('open')) {
            $this.removeClass('open').addClass('closed');
            $('tr[data-table=' + id + ']').hide();

          } else {
            $this.removeClass('closed').addClass('open');
            $('tr[data-table=' + id + ']').show();

          }
        });

        $row.prepend(BDA_XML_DEF.buildQuickNav());

        //activate
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();

        logTrace('bdaXmlDef build end');

      } catch (e) {
        console.error(e);
      }
    },

    searchInTable: function() {
      var $items = BDA_XML_DEF.$ITEMS;
      var $input = $('#xmlDefSearchBox');
      var val = $.trim($input.val()).replace(/ +/g, ' ').toLowerCase();
      $items
        .show()
        .removeHighlight()
        .highlight(val)
        .filter(function() {
          var text = $(this).text(); //.replace(/\s+/g, ' ').toLowerCase();
          return !~text.indexOf(val);
        })
        .hide();

      //update quicknav

      var $itemPanels = BDA_XML_DEF.$xmlDefTable.find('.item-panel:visible');
      var ids = $itemPanels.map(function() {
          return $(this).attr('id');
        })
        .get();
      logTrace(JSON.stringify(ids));

      try {

        $('#quickNavLinks li')
          .show()
          .filter(function() {
            var href = $(this).children('a:first').attr('href').replace('#', '');
            logTrace(href);
            var res = !~$.inArray(href, ids);
            logTrace(res);
            return res;
          })
          .hide();
      } catch (e) {
        console.error(e);
      }

      var elem = $('span.highlight').first();
      $('html, body').animate({
        scrollTop: elem.offset().top
      }, 1000);

    },

    buildSubTableHeader: function(tableName) {
      //headers
      var cols = [];
      var attr;
      for (var i = 0; i < BDA_XML_DEF.templates.tableColumns.length; i++) {
        attr = BDA_XML_DEF.templates.tableColumns[i];
        cols.push('<th>{0}</th>'.format(attr.name));
      }
      return '<tr class="active" data-table="tabledef_{1}">{0}</tr>'.format(cols.join(''), tableName);
    },

    buildTableHeader: function($table) {

      var cols = ['<ol class="itemDescAttributes">'];
      var tableName = $table.attr('name');
      var attr, val;
      cols.push('<li class="table-name">{0}</li>'.format(tableName));
      for (var i = 0; i < BDA_XML_DEF.templates.tableHeader.length; i++) {
        attr = BDA_XML_DEF.templates.tableHeader[i];
        val = $table.attr(attr);
        if (!isNull(val)) {
          cols.push('<li>{0} : <span class="attr-value">{1}</span></li>'.format(attr, val));
        }
      }
      cols.push('</ol>');
      return '<tr id="tabledef_{1}" class="table-def open"><th colspan="{2}">{0}</th></tr>'.format(cols.join(''), tableName, BDA_XML_DEF.templates.tableColumns.length);

    },

    buildQuickNav: function() {

      var $container = $('<div class="col-lg-2 container"></div>');
      var $quickNav = $('<div id="xmlDefQuickNav" class="panel panel-default"></div>');
      BDA_XML_DEF.$quickNav = $quickNav;
      var $body = $('<div class="panel-body"></div>');
      $container.append($quickNav);
      $quickNav.append($(BDA_XML_DEF.templates.quickNavHeader));
      $quickNav.append($body);



      $body.append(
        $(BDA_XML_DEF.templates.quickNavSearch)
      );

      var linkContainer = $('<div id="quickNavLinks" class="" ></div>');
      var items = $('<ul class="nav nav-pills nav-stacked"></ul>');
      var $item;
      var $itemPanels = BDA_XML_DEF.$xmlDefTable.find('.item-panel');
      $itemPanels.each(function(idx, item) {
        $item = $(item);
        items.append($('<li><a href="#{0}">{1}</a></li>'.format($item.attr('id'), $item.attr('data-item-descriptor'))));
      });
      linkContainer.append(items);
      $body.append(linkContainer);

      var searchTimeOut;
      $body.find('#xmlDefSearchBox').on('keyup', function() {
        clearTimeout(searchTimeOut);
        searchTimeOut = setTimeout(BDA_XML_DEF.searchInTable, 200);
      });

      $body.find('#clearQuickNavSearch').on('click', function() {
        $body.find('#xmlDefSearchBox').val('');
        clearTimeout(searchTimeOut);
        searchTimeOut = setTimeout(BDA_XML_DEF.searchInTable, 200);
      });

      $quickNav.find('#quickNavCollapse').on('click', function() {
        BDA_XML_DEF.showXmlDefAsTable();
        $('html, body').animate({
          scrollTop: $('#xmlDefAsTableSection').offset().top - 5
        }, 0);
      });
      $quickNav.find('#quickNavMoveTop').on('click', function() {
        $('html, body').animate({
          scrollTop: BDA_XML_DEF.$xmlDefTable.offset().top - 5
        }, 0);
      });
      $quickNav.find('#quickNavMoveBot').on('click', function() {
        $('html, body').animate({
          scrollTop: BDA_XML_DEF.$xmlDefTable.offset().top + BDA_XML_DEF.$xmlDefTable.height() + 10 //outside the sticky zone
        }, 0);
      });

      var menuItems = items.find('a');

      $(window).scroll(function() { // scroll event

        //sticky menu
        var $window = $(window);
        var windowTop = $window.scrollTop();
        //get the value now because it changes on show/hide/collapse
        var top = BDA_XML_DEF.$xmlDefTable.offset().top;
        var bot = top + BDA_XML_DEF.$xmlDefTable.height();

        try {
          if (top < windowTop && bot > windowTop) {
            $quickNav.addClass('sticky-top');
          } else {
            $quickNav.removeClass('sticky-top');
          }
        } catch (e) {
          console.error(e);
        }

        //custom scrollspy
        //select currently visible items
        $itemPanels = BDA_XML_DEF.$xmlDefTable.find('.item-panel:visible');

        //find elems on top of current scroll pos
        var elemsOnTop = $itemPanels.map(function() {
          if ($(this).offset().top < windowTop + 10) // offset of 10 for readability
            return this;
        });
        // Get the id of the current element
        var cur = elemsOnTop.last();
        var id = cur.attr('id');
        var activeElem;
        if (BDA_XML_DEF.scrollSpyLastId !== id) {
          BDA_XML_DEF.scrollSpyLastId = id;
          // Set/remove active class
          activeElem = menuItems
            .parent().removeClass("active") //remove all active class
            .end().filter("[href='#" + id + "']").parent().addClass("active"); //add active to current elem

          //scroll elem into visibility:
          //if elem bot is > container top
          var elemBot = activeElem.offset().top + activeElem.height();
          var myContainer = $('#quickNavLinks');

          //   console.log('scrollTo.offset().top : {0} myContainer.offset().top : {1} myContainer.scrollTop() : {2}'.format(activeElem.offset().top, myContainer.offset().top, myContainer.scrollTop()))
          //  console.log('elemBot : ' + elemBot);

          if (elemBot < myContainer.offset().top) {
            myContainer.animate({
              scrollTop: activeElem.offset().top - myContainer.offset().top + myContainer.scrollTop()
            }, 50);
          }
          var containerBot = myContainer.offset().top + myContainer.height();
          if (activeElem.offset().top > containerBot) {
            myContainer.animate({
              scrollTop: elemBot - containerBot + myContainer.scrollTop()
            }, 50);
          }
        }


      });

      $(window).resize(function() {
        BDA_XML_DEF.resizeQuickNav();
      });

      return $container;
    },

    buildItemHeader: function($itemDesc) {
      var values = [],
        attrDef, val;
      values.push('<ol class="itemDescAttributes">');
      for (var i = 0; i < BDA_XML_DEF.templates.itemHeader.length; i++) {
        attrDef = BDA_XML_DEF.templates.itemHeader[i];
        val = $itemDesc.attr(attrDef);
        if (val) {
          values.push('<li>{0} : <span class="attr-value">{1}</span></li>'.format(attrDef, val));
        }
      }
      values.push('</ol>');
      return values.join('');
    },

    resizeQuickNav: function() {
      var $quickNav = BDA_XML_DEF.$quickNav;
      $quickNav.removeAttr('style');
      $quickNav.css('width', $quickNav.css('width'));
    }

  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaXmlDef = function(pBDA) {
    console.log('Init plugin {0}'.format('bdaXmlDef'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_XML_DEF.build();
    return this;
  };

})(jQuery);
