(function($) {
  "use strict";
  BDA_TOOLBAR = {

    build : function()
    {
        BDA_TOOLBAR.showComponentHsitory();
        BDA_TOOLBAR.createToolbar();
        // Collect history
        if (BDA.isComponentPage)
          BDA_TOOLBAR.collectHistory();
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
        var tagNames = unique(BDA_TOOLBAR.buildArray(tagString));
        return BDA_TOOLBAR.buildTagsFromArray(tagNames,defaultValue);
    },

    editTags : function(newTags)
    {
      console.log('editTags + ' + JSON.stringify(newTags));
       var existingTags = BDA_TOOLBAR.getTags();
       for (var name in existingTags)
       {
        if(newTags[name])
        {
          var oldTag = existingTags[name];
          newTags[name].selected = oldTag.selected;
        }
       }
      BDA_TOOLBAR.saveTags(newTags);
    },

    addTags : function(newTags)
    {
      console.log('add tags:');
      var existingTags = getTags();
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
      BDA_TOOLBAR.saveTags(existingTags);
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

    clearTags : function()
    {
        console.log('clearTags');
        var savedtags = BDA_TOOLBAR.getTags();
          for (var sTagName in savedtags)
          {
             var sTag = savedtags[sTagName];
             sTag.selected = false;
          }

        console.log('savedtags = ' + JSON.stringify(savedtags));
        BDA_TOOLBAR.saveTags(savedtags);
        BDA_TOOLBAR.reloadToolbar();
    },

    //--- History functions ------------------------------------------------------------------------
    collectHistory : function ()
    {
      if (document.URL.indexOf("?") >= 0)
        return ;
      if (document.URL.indexOf("#") >= 0)
        return ;

      var componentPath = purgeSlashes(document.location.pathname);
      var componentHistory =  JSON.parse(localStorage.getItem('componentHistory')) || [];
      if ($.inArray(componentPath, componentHistory) == -1)
      {
        console.log("Collect : " + componentPath);
        componentHistory.unshift(componentPath);
        if (componentHistory.length >= 10)
          componentHistory = componentHistory.slice(0, 9);
        BDA_STORAGE.storeItem('componentHistory', JSON.stringify(componentHistory));
      }
    },

    showComponentHsitory : function ()
    {
      $("<div id='history'></div>").insertAfter(BDA.logoSelector);
      var componentHistory =  JSON.parse(localStorage.getItem('componentHistory')) || [];
      var html = "Component history : ";
      for (var i = 0; i != componentHistory.length; i++)
      {
        if (i !== 0)
          html += ", ";
        var comp = componentHistory[i];
        html += "<a href='" + comp + "'>" + getComponentNameFromPath(comp) + "</a>";
      }
      $("#history").html(html);
    },

    //--- Toolbar functions ------------------------------------------------------------------------

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

    deleteComponent : function (componentToDelete)
    {
      console.log("Delete component : " + componentToDelete);
      var components = BDA_TOOLBAR.getStoredComponents();
      for(var i = 0; i != components.length; i++)
      {
        if (components[i].componentName == componentToDelete)
        {
          components.splice(i , 1);
          break;
        }
      }
      console.log(components);
      BDA_STORAGE.storeItem('Components', JSON.stringify(components));
      BDA_TOOLBAR.reloadToolbar();
    },

    storeComponent : function (component, methods, vars,tags)
    {
      console.log("Try to store : " + component);
      var compObj = {};
      compObj.componentPath = component;
      compObj.componentName = getComponentNameFromPath(component);
      compObj.colors = BDA_TOOLBAR.stringToColour(compObj.componentName);
      var storedComp = BDA_TOOLBAR.getStoredComponents();
      if (storedComp.length > 0)
        compObj.id = storedComp[storedComp.length - 1].id + 1;
      console.log("id : " + compObj.id);

      compObj.methods = methods;
      compObj.vars = vars;
      compObj.tags =tags;
      storedComp.push(compObj);

      BDA_STORAGE.storeItem('Components', JSON.stringify(storedComp));
      var tagMap = BDA_TOOLBAR.buildTagsFromArray(tags,false);
      BDA_TOOLBAR.addTags(tagMap);
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
      return BDA_TOOLBAR.colorToCss(borderColor);
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
      return BDA_TOOLBAR.verifyColor(colors);
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
      BDA_TOOLBAR.deleteToolbar();
      BDA_TOOLBAR.createToolbar();
    },

    isComponentAlreadyStored : function(componentPath)
    {
      var components = BDA_TOOLBAR.getStoredComponents();
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
      + "</div>").insertAfter(BDA.logoSelector);

      BDA_TOOLBAR.addExistingTagsToToolbarPopup();

      var favs = BDA_TOOLBAR.getStoredComponents();

      $("<div id='toolbarContainer'></div>").insertAfter(BDA.logoSelector);
      $("<div id='toolbar'></div>").appendTo("#toolbarContainer");

      var tags = BDA_TOOLBAR.getTags();
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
          logTrace(fav.componentName + ' = ' + componentTags);
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
        if(show)
        {
          var colors = BDA_TOOLBAR.stringToColour(fav.componentName);
          var shortName = getComponentShortName(fav.componentName);
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
          .css("background-color", BDA_TOOLBAR.colorToCss(colors))
          .css("border", "1px solid " + BDA_TOOLBAR.getBorderColor(colors))
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
        rotateArrow($("#" + id + " i"));

      });

      $(".favDelete").click(function() {
        console.log("Click on delete");
        var componentToDelete = this.id.replace("delete", "");
        BDA_TOOLBAR.deleteComponent(componentToDelete);
      });

      $(".logdebug").click(function() {
        console.log("Click on logdebug");
        var componentName = this.id.replace("logDebug", "");
        var logDebugState = this.innerHTML;
        console.log("component : " + componentName + ", logDebugState : " + logDebugState);
        $("#logDebugForm" + componentName + " input[name=newValue]").val(logDebugState);
        $("#logDebugForm" + componentName).submit();
      });


      if (BDA.isComponentPage)
      {
        var componentPath = purgeSlashes(document.location.pathname);
        if (!BDA_TOOLBAR.isComponentAlreadyStored(componentPath))
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
                var tags = BDA_TOOLBAR.buildArray($('#newtags').val());
                //add selected tags
                $('.tag:checked').each(function(index, element){
                    tags.push(element.parentElement.textContent);
                });
                //remove dupes
                tags=unique(tags);

                console.log("methods : " + methods);
                console.log("vars : " + vars);
                console.log("tags : " + tags);
                BDA_STORAGE.storeComponent(componentPath, methods, vars,tags);
                BDA_TOOLBAR.reloadToolbar();
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
            var defMethods = BDA_STORAGE.getConfigurationValue('default_methods');
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

            var defProperties = BDA_STORAGE.getConfigurationValue('default_properties');
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

       BDA_TOOLBAR.addFavTagList();
    },

    addExistingTagsToToolbarPopup : function()
    {
        //add tags to the addFav popup
      var tags = BDA_TOOLBAR.getTags();
      var $tagList = $('#existingTags');

      var sortedTags = [];
      for (var tagName in tags) {
        sortedTags.push(tagName);
      }
      sortedTags = sort(sortedTags);

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
      var tags = BDA_TOOLBAR.getTags();
      if(tags !== null && Object.keys(tags).length> 0){
        $("<div class='toolbar-elem favFilter'><a href='javascript:void(0)' id='favFilter' title='Filter'><i class='fa fa-chevron-down fav-chevron'></i></a></div>")
          .on('click',function () {
              var open = BDA_STORAGE.getConfigurationValue('filterOpen');
              if(open === null || open === undefined || !open){
                open = false;
              }
              BDA_STORAGE.storeConfiguration('filterOpen',!open);

              $('#favTagList').toggle(50);
          })
          .appendTo("#toolbar");
      }
    },

    addFavTagList : function()
    {
      console.log('addfavTagList');
      var tags = BDA_TOOLBAR.getTags();

      var $favline = $('<div id="favTagList" class="favline">').appendTo('#toolbar');

      var $list = $('<ul></ul>');

      //if at least one filter
      if(tags !== null && Object.keys(tags).length> 0){
        $('<button id="clear-filters" class="bda-button bda-button-icon" title="Clear"><i class="fa fa-times" aria-hidden="true"></i></button>')
         .on('click',BDA_TOOLBAR.clearTags)
         .appendTo(
            $('<li class="tag-filter" ></li>')
           .appendTo($list)
         );
      }

      var sortedTags = [];
      for (var tagName in tags) {
        sortedTags.push(tagName);
      }
      sortedTags = sort(sortedTags);

      for (var i = 0; i < sortedTags.length; i++) {
        tagName = sortedTags[i];
        var tag = tags[tagName];
        var tagColor = BDA_TOOLBAR.stringToColour(tagName);

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
            var tags = BDA_STORAGE.getTags();
            var tag = tags[name];
            if(tag !== null)
              tag.selected=$(this).prop('checked');
            BDA_STORAGE.saveTags(tags);
            BDA_STORAGE.reloadToolbar();
         })
         .appendTo(
           $('<li class="bda-button tag-filter" ></li>')
           .css("background-color", BDA_TOOLBAR.colorToCss(tagColor))
           .css("border", "1px solid " + BDA_TOOLBAR.getBorderColor(tagColor))
           .appendTo($list)
         )
        );

      }
      $list.appendTo($favline);
    },
  };
  // Reference to BDA
  var BDA;
  // Reference to BDA_STORAGE
  var BDA_STORAGE;

  var initalized = false;

  reloadToolbar = function()
  {
    BDA_TOOLBAR.reloadToolbar();
  };

  // Jquery plugin creation
  $.fn.bdatoolbar = function(pBDA)
  {
    if (!initalized)
    {
      console.log('Init plugin {0}'.format('bdaRepository'));
      //settings = $.extend({}, defaults, options);
      BDA = pBDA;
      BDA_STORAGE = $().bdaStorage();
      BDA_TOOLBAR.build();
      initalized = true;
    }
    return this;
  };
})(jQuery);
