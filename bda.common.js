//Primary anonymous wrapper to ensure that this section will be executed only once.

try{

  console.log('bda.common.js start');
  var isLoggingTrace = false;
  var xmlDefinitionCacheTimeout = 1200; // 20min

  // ----- Standard Javascript override -----

  // Change Array.toString() default behavior, will display array content.
  //
  // @return String representation of the array.
  Array.prototype.toString = function() {
    return this.join(', ');
  };

  // Utility function to display formated Strings (avoid bad '+'
  // combinations).
  //
  // Example:
  // 'Say {0} to {1} !'.format('hello', 'Toto') -> 'Say hello to Toto !'.
  //
  // @param args: array of arguments.
  //
  // @return Formatted string, original string if no argument is provided.
  if (!String.prototype.format) {

    String.prototype.format = function() {

      var args = arguments;

      return this.replace(/{(\d+)}/g,
          function(match, number) {
        return typeof args[number] !== undefined ? args[number]
        : match;
      });
    };
  }

  // simple is Null fct
  this.isNull = function(object) {
    if(null === object || undefined === object) {
      return true;
    }
    return false;
  };

  // BDA Common functions


  this.buildArray = function(stringIn)
  {
    var cleaned = stringIn.replace(/[ \t]/g,'').replace(/,,+/g,',');
    var array;
    if (cleaned !== "")
      array = cleaned.split(',');
    else
      array = [];
    return array;
  },

  this.buildTagsFromArray = function(tagNames,defaultValue)
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

  this.processRepositoryXmlDef = function(property, callback)
  {
    if(callback !== undefined)
    {
      // First check cache value if any
      var rawXmlDef = getXmlDef(getCurrentComponentPath());
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
            if ($result.find("pre").length > 0)
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
                    storeXmlDef(getCurrentComponentPath(), rawXmlDef);
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
  };

  this.getXmlDef = function(componentPath)
  {
    console.log("Getting XML def for : " + componentPath);
    var timestamp =  Math.floor(Date.now() / 1000);
    var xmlDefMetaData = JSON.parse(localStorage.getItem("XMLDefMetaData"));
    if (!xmlDefMetaData)
      return null;
    if (xmlDefMetaData.componentPath != componentPath || (xmlDefMetaData.timestamp + xmlDefinitionCacheTimeout) < timestamp)
    {
      console.log("Xml def is outdated or from a different component");
      return null;
    }
    return localStorage.getItem("XMLDefData");
  };

  this.storeXmlDef = function(componentPath, rawXML)
  {
    console.log("Storing XML def : " + componentPath);
    var timestamp =  Math.floor(Date.now() / 1000);

    localStorage.setItem("XMLDefMetaData", JSON.stringify({componentPath : componentPath, timestamp: timestamp}));
    localStorage.setItem("XMLDefData", rawXML);
  };

  this.highlightAndIndentXml = function($elm)
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
  };

  this.getComponentNameFromPath = function (componentPath)
  {
    // Strip last slash if any
    if (componentPath[componentPath.length - 1] == "/")
      componentPath = componentPath.substr(0 , componentPath.length - 1);

    var tab = componentPath.split("/");
    //console.log("For component :" + componentPath + ", name is : " + (tab[tab.length - 1]));
    return tab[tab.length - 1];
  };

  this.purgeSlashes = function(str)
  {
    return str.replace(/([^:]\/)\/+/g, "$1");
  };

  this.getComponentShortName = function (componentName)
  {
    var shortName = "";
    for(var i = 0; i != componentName.length; i++)
    {
      var character = componentName[i];
      if (character == character.toUpperCase() && character != ".")
        shortName += character;
    }
    return shortName;
  };

  this.getCurrentComponentPath = function()
  {
    return purgeSlashes(document.location.pathname.replace("/dyn/admin/nucleus", ""));
  };

  this.logTrace = function (msg)
  {
    if(isLoggingTrace){
      console.log(msg);
    }
  };

  this.unique = function (array)
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
  };

  this.sort = function (array)
  {
    logTrace('beforeSort : ' + array);
    var sorted = array.sort(function(a,b) {
      if(a !== null)
        return a.localeCompare(b, 'en', { caseFirst: 'upper' });
      else if( b !== null)
        return -1;
      else
        return 0;
    });
    logTrace('after sort : ' + sorted);
    return sorted;
  };


  this.copyToClipboard = function (text)
  {
    GM_setClipboard(text);
    window.alert("Data have been added to your clipboard");
  };

  this.rotateArrow = function ($arrow)
  {
    if ($arrow.hasClass("fa-arrow-down"))
      $arrow.removeClass("fa-arrow-down").addClass("fa-arrow-up");
    else
      $arrow.removeClass("fa-arrow-up").addClass("fa-arrow-down");
  };

  this.endsWith = function (str, suffix)
  {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  this.buildSimpleTable = function($item,tableTemplate,rowTemplate){
    var itemDesc = $item.attr('item-descriptor');
    var id = $item.attr('id');
    var rows = [];
    $item.find('set-property').each(function(){
      var $row = $(this);
      rows.push(rowTemplate.format($row.attr('name'),$row.text()));
    });
    var table = tableTemplate.format(itemDesc,id,rows.join(''));

    return table;
  }

  console.log('bda.common.js initialized');
}catch(e){
  console.log(e);
}
