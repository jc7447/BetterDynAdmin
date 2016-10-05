(function($) {
  "use strict";
  var BDA_XML_DEF = {

    tableInitialized: false,
    isXMLDefinitionFilePage: false,
    xmlDefinitionMaxSize: 150000, // 150 Ko
    repositoryRootNode:'gsa-template',
    dtdTitle: 'System Id (DTD name)',
    repositoryDTDId:'gsa',
    templates: {
      itemDescTable: '<div id="item_{0}" class="panel panel-default item-panel" data-item-descriptor="{0}" data-index={3}>' +
        '<div class="panel-heading item-descriptor-heading open" data-target="{0}">' +
        '{1}' +
        '</div>' +
        '<div class="panel-body" >' +
        '{2}' +
        '</div>' +
        '</div>',
      itemHeader: [

        {name: 'sub-type-property'},
        {name: 'super-type' ,
          build: function($itemDesc){
            var superType = $itemDesc.attr('super-type');
            var val;
            if(!isNull(superType)){
              val =  '<a href="#item_{0}">{0}</a>'.format(superType);
            }
            return val;
          }},
        {name: 'cache-mode' },
        {name: 'item-cache-timeout'},
        {name: 'item-cache-size' },
      ],
      colgroup: '<colgroup>' +
        '<col class="col-1" />' +
        '<col span="8" class="col-bda-12" />' +
        '</colgroup>',
      tableHeader: ['type', 'id-column-name', 'shared-table-sequence'],
      tableColumns: [{
        name: 'name',
        class: 'col-lg-3'
      }, {
        title: 'data / item-type',
        class: 'col-lg-2',
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
            tooltip = 'data-html="true" data-trigger="hover focus click" data-toggle="popover" ' +
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
        class: 'col-lg-2'
      }, {
        name: 'required',
        class: 'col-lg-1'
      }, {
        title: 'property-type / derivation',
        class: 'col-lg-2',
        build: function($prop, itemName) {
          //property descriptor
          var full = $prop.attr('property-type');
          var values = [];
          if (!isNull(full) && full !== "") {
            var slices = full.split('.');
            var propertyType = '<span class="property-type" data-toggle="tooltip"  data-trigger="hover focus click" data-placement="top" title="{1}">{0}</span>'
              .format(slices[slices.length - 1], full);
            values.push(propertyType);
          }
          //derivation
          var derivation = "",
            drvText;
          $prop.find('derivation').each(function(idx, drv) {
            drvText = $(drv).outerHTML();
            //   drvText = $("<div>").text(drvText).html().replace(/"/g,'&quot;');

            derivation += '<span class="derivation" data-html="true" data-trigger="hover focus click" data-toggle="popover" ' +
              'data-placement="top" data-target="#pop_derivation_{1}_{2}" >Derivation</span><div id="pop_derivation_{1}_{2}" class="hide">{0}</div>'
              .format(drvText, itemName, $prop.attr('name'));
            values.push(derivation);
          })

          return values.join('<br/>');
        }
      }, {
        name: 'default',
        class: 'col-lg-1'
      }, {
        name: 'cache-mode',
        title: 'Cache-mode',
        class: 'col-lg-05'
      }, {
        name: 'queryable',
        title: 'Queryable',
        class: 'col-lg-05'
      }],
      quickNavSearch: '<div class="input-group"><input id="xmlDefSearchBox" type="text" placeholder="Search : table, column,  item ..." class="form-control"/>' +
        ' <span class="input-group-btn">' +
        '<button id="clearQuickNavSearch" class="btn btn-default" type="button">x</button>' +
        '</span></div>',
      quickNavHeader: '<div class="panel-heading">' +
        ' <h3 class="panel-title pull-left">QckNv</h3>' +

        '<div class="btn-group pull-right" role="group">' +

        '<button id="quickNavSort" class="btn btn-default" data-sort="off">' +
        '<i class="fa fa-sort-alpha-asc" aria-hidden="true"></i>' +
        '</button>' +

        '<button id="quickNavMoveBot" class="btn btn-default">' +
        '<i class="fa fa-level-down" aria-hidden="true"></i>' +
        '</button>' +

        '<button id="quickNavMoveTop" class="btn btn-default">' +
        '<i class="fa fa-level-up" aria-hidden="true"></i>' +
        '</button>' +

        '<button id="quickNavCollapse" class="btn btn-default">' +
        '<i class="fa fa-minus-square" aria-hidden="true"></i>' +
        '</button>' +

        '</div>' +

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

      if(BDA_XML_DEF.isRepositoryDefinition()){
        BDA_XML_DEF.addDisplayXmlAsTableButton();
      }

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

    isRepositoryDefinition:function(){
      var dtdName = $('td:contains("{0}")'.format(BDA_XML_DEF.dtdTitle)).next().text();
      console.log('dtdName %s',dtdName);
      return !isNull(dtdName) && dtdName.indexOf(BDA_XML_DEF.repositoryDTDId) !== -1;
//repositoryRootNode
    },

    addDisplayXmlAsTableButton: function() {

      var tableSection = $('<p id="xmlDefAsTableSection"></p>')

      .insertAfter($("h3:contains('Value')"))
        .append($('<button id="showXmlAsTable" class="">Display as table</button>').on('click', BDA_XML_DEF.showXmlDefAsTable));
      //temp

      var BDA_STORAGE = $.fn.bdaStorage.getBdaStorage();
      var defaultOpenXmlDefAsTable = BDA_STORAGE.getConfigurationValue('defaultOpenXmlDefAsTable');
      if (defaultOpenXmlDefAsTable) {
        BDA_XML_DEF.showXmlDefAsTable();
      }
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
      console.time('buildXmlDefAsTable');

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
            var itemHeader = BDA_XML_DEF.buildItemHeader(itemDescName, $itemDesc);

            //   rows.push('<div id="header_{0}" data-target="{0}" class="row item-descriptor bg-success open"><div class="col-lg-12">{1}</div></div>'.format( itemDescName, itemHeader));
            //
            $itemDesc.find('div').each(function(idx, table) {
              $table = $(table);
              tableName = $table.attr('name');
              //table def
              rows.push(BDA_XML_DEF.buildTableHeader($table));

              rows.push(BDA_XML_DEF.buildSubTableHeader(tableName));

              //properties that are tables:
              $table.find('property').each(function(idx, propertyDesc) {
                $propertyDesc = $(propertyDesc, itemDescName);
                cols = [];
                for (var i = 0; i < BDA_XML_DEF.templates.tableColumns.length; i++) {
                  attrDef = BDA_XML_DEF.templates.tableColumns[i];
                  if (!isNull(attrDef.build)) {
                    val = attrDef.build($propertyDesc);
                  } else {
                    val = $propertyDesc.attr(attrDef.name);
                  }
                  if (isNull(val) || val === "") {
                    val = "&nbsp;";
                  }
                  cols.push('<div class="{1}">{0}</div>'.format(val, attrDef.class));
                }
                rows.push('<div class="row property" data-table="tabledef_{1}">{0}</div>'.format(cols.join(''), tableName));
              });
              //

            });

            if ($itemDesc.children('property').length > 0) {

              //non table properties (transient/dynamic)
              //headers
              var tableName = 'nontabledef_' + itemDescName;
              rows.push('<div id="tabledef_{1}" class="row table-def open"><div class="col-lg-12">Non table properties</div></div>'.format(BDA_XML_DEF.templates.tableColumns.length, tableName));
              rows.push(BDA_XML_DEF.buildSubTableHeader(tableName));

              $itemDesc.children('property').each(function(idx, propertyDesc) {
                $propertyDesc = $(propertyDesc);
                cols = [];
                for (var i = 0; i < BDA_XML_DEF.templates.tableColumns.length; i++) {
                  attrDef = BDA_XML_DEF.templates.tableColumns[i];
                  if (!isNull(attrDef.build)) {
                    val = attrDef.build($propertyDesc, itemDescName);
                  } else {
                    val = $propertyDesc.attr(attrDef.name);
                  }
                  if (isNull(val) || val === "") {
                    val = "&nbsp;";
                  }
                  cols.push('<div class="{1}">{0}</div>'.format(val, attrDef.class));
                }
                rows.push('<div class="row property" data-table="tabledef_{1}">{0}</div>'.format(cols.join(''), tableName));
              });
              //
            }

            $panel = $(
              BDA_XML_DEF.templates.itemDescTable.format(itemDescName, itemHeader, rows.join(''), idx)
            );
            itemSize[itemDescName] = rows.length;
            // $panel.find('#header_'+itemDescName).prepend($(BDA_XML_DEF.templates.collapserColumn.format(rows.length,itemDescName)));

            $container.append($panel);


          });

        });

        BDA_XML_DEF.$ITEMS = $container.find('.panel');
        var searchTimeOut;

        $('.item-descriptor-heading').on('click', function() {
          var $this = $(this);
          var target = $this.attr('data-target');
          if ($this.hasClass('open')) {
            $this.removeClass('open').addClass('closed');
            $('#item_' + target).find('.panel-body .row').hide();
          } else {
            $this.removeClass('closed').addClass('open');
            $('#item_' + target).find('.panel-body .row').show();
          }
        });

        $('.table-def').on('click', function() {
          var $this = $(this);
          var id = $this.attr('id');
          if ($this.hasClass('open')) {
            $this.removeClass('open').addClass('closed');
            $('.row[data-table=' + id + ']').hide();

          } else {
            $this.removeClass('closed').addClass('open');
            $('.row[data-table=' + id + ']').show();

          }
        });

        $row.prepend(BDA_XML_DEF.buildQuickNav());

        //activate
        $('[data-toggle="tooltip"]').tooltip();

        $('[data-toggle="popover"]').each(function() {
          var $this = $(this);
          var targetId = $this.attr('data-target');
          if (isNull(targetId)) {
            $this.popover();
          } else {
            var xml = $(targetId).html();
            var codeBlock = $("<pre></pre>").text(xml);
            //hightlight the content
            highlightAndIndentXml(codeBlock);
            $this.popover({
              content: codeBlock.outerHTML()
            })
          }
        });

        logTrace('bdaXmlDef build end');

      } catch (e) {
        console.error(e);
      }
      console.timeEnd('buildXmlDefAsTable');
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
      var attr, title;
      for (var i = 0; i < BDA_XML_DEF.templates.tableColumns.length; i++) {
        attr = BDA_XML_DEF.templates.tableColumns[i];
        title = attr.title;
        if (isNull(title)) {
          title = attr.name;
        }
        cols.push('<div class="{1}">{0}</div>'.format(title, attr.class));
      }
      return '<div class="row subtableHeader" data-table="tabledef_{1}">{0}</div>'.format(cols.join(''), tableName);
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
      return '<div id="tabledef_{1}" class="row table-def open"><div class="col-lg-12">{0}</div></div>'.format(cols.join(''), tableName);

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
        items.append(
          $(
            '<li data-item-descriptor="{2}" data-index="{3}"><a href="#{0}">{1}</a></li>'
            .format(
              $item.attr('id'),
              $item.attr('data-item-descriptor'),
              $item.attr('data-item-descriptor'),
              $item.attr('data-index')
            )
          )
        );
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

      var compItemDescriptorFc = compareAttrFc('data-item-descriptor');
      var compIndexFc = compareAttrFc('data-index');

      $quickNav.find('#quickNavSort').on('click', function() {
        var $this = $(this);
        if ($this.hasClass('sorted')) {

          $('#definitionsContainer').sortContent('.item-panel', compIndexFc);
          $('#quickNavLinks > ul').sortContent('li', compIndexFc);

          $this.removeClass('sorted');
        } else {

          $('#definitionsContainer').sortContent('.item-panel', compItemDescriptorFc);
          $('#quickNavLinks > ul').sortContent('li', compItemDescriptorFc);

          $this.addClass('sorted');
        }
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



    buildItemHeader: function(itemDescName, $itemDesc) {
      var values = [],
        attrConf, val;
      values.push('<ol class="itemDescAttributes"><li><span class="attr-value">{0}</span></li>'.format(itemDescName));
      for (var i = 0; i < BDA_XML_DEF.templates.itemHeader.length; i++) {
        attrConf = BDA_XML_DEF.templates.itemHeader[i];
        if(!isNull(attrConf.build)){
          val = attrConf.build($itemDesc);
        }else{
          val = $itemDesc.attr(attrConf.name);
          
        }
        if (val) {
          values.push('<li>{0} : <span class="attr-value">{1}</span></li>'.format(attrConf.name, val));
        }
      }
      values.push('</ol>');
      return values.join('');
    },

    resizeQuickNav: function() {
      var $quickNav = BDA_XML_DEF.$quickNav;
      //reset the style and stickyness to reset to normal size
      var sticky = false;
      if ($quickNav.hasClass('sticky-top')) {
        $quickNav.removeClass('sticky-top');
        sticky = true;
      }
      $quickNav.removeAttr('style');
      var windowH = window.innerHeight;
      $quickNav.find('#quickNavLinks').adjustToFit($quickNav, windowH);
      //fix the values so that it behaves correctly when sticky
      $quickNav.css({
        'width': $quickNav.css('width'),
      });

      if (sticky) {
        //reaply
        $quickNav.addClass('sticky-top');
      }
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