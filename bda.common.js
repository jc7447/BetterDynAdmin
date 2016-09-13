//Primary anonymous wrapper to ensure that this section will be executed only once.

try {

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
          return typeof args[number] !== undefined ? args[number] : match;
        });
    };
  }

  // simple is Null fct
  this.isNull = function(object) {
    if (null === object || undefined === object) {
      return true;
    }
    return false;
  };

  // BDA Common functions


  this.buildArray = function(stringIn) {
      var cleaned = stringIn.replace(/[ \t]/g, '').replace(/,,+/g, ',');
      var array;
      if (cleaned !== "")
        array = cleaned.split(',');
      else
        array = [];
      return array;
    },

    this.buildTagsFromArray = function(tagNames, defaultValue) {
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

    this.processRepositoryXmlDef = function(property, callback) {
      if (callback !== undefined) {
        // First check cache value if any
        var rawXmlDef = getXmlDef(getCurrentComponentPath());
        if (rawXmlDef !== null) {
          console.log("Getting XML def from cache");
          var xmlDoc = jQuery.parseXML(rawXmlDef);
          if (callback !== undefined)
            callback($(xmlDoc));
        }
        // If no cache entry, fetch the XML def in ajax
        else {
          var url = location.protocol + '//' + location.host + location.pathname + "?propertyName=" + property;
          console.log(url);
          jQuery.ajax({
            url: url,
            success: function(result) {
              var $result = $(result);
              if ($result.find("pre").length > 0) {
                rawXmlDef = $result.find("pre")
                  .html()
                  .trim()
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace("&nbsp;", "")
                  .replace("<!DOCTYPE gsa-template SYSTEM \"dynamosystemresource:/atg/dtds/gsa/gsa_1.0.dtd\">", "");
                try {
                  console.log("XML def length : " + rawXmlDef.length);
                  var xmlDoc = jQuery.parseXML(rawXmlDef);
                  storeXmlDef(getCurrentComponentPath(), rawXmlDef);
                  callback($(xmlDoc));
                } catch (err) {
                  console.log("Unable to parse XML def file !");
                  callback(null);
                  console.log(err);
                }
              } else
                callback(null);
            },
          });
        }
      }
    };

  this.getXmlDef = function(componentPath) {
    console.log("Getting XML def for : " + componentPath);
    var timestamp = Math.floor(Date.now() / 1000);
    var xmlDefMetaData = JSON.parse(localStorage.getItem("XMLDefMetaData"));
    if (!xmlDefMetaData)
      return null;
    if (xmlDefMetaData.componentPath != componentPath || (xmlDefMetaData.timestamp + xmlDefinitionCacheTimeout) < timestamp) {
      console.log("Xml def is outdated or from a different component");
      return null;
    }
    return localStorage.getItem("XMLDefData");
  };

  this.storeXmlDef = function(componentPath, rawXML) {
    console.log("Storing XML def : " + componentPath);
    var timestamp = Math.floor(Date.now() / 1000);

    localStorage.setItem("XMLDefMetaData", JSON.stringify({
      componentPath: componentPath,
      timestamp: timestamp
    }));
    localStorage.setItem("XMLDefData", rawXML);
  };

  this.highlightAndIndentXml = function($elm) {
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

  this.getComponentNameFromPath = function(componentPath) {
    // Strip last slash if any
    if (componentPath[componentPath.length - 1] == "/")
      componentPath = componentPath.substr(0, componentPath.length - 1);

    var tab = componentPath.split("/");
    //console.log("For component :" + componentPath + ", name is : " + (tab[tab.length - 1]));
    return tab[tab.length - 1];
  };

  this.purgeSlashes = function(str) {
    return str.replace(/([^:]\/)\/+/g, "$1");
  };

  this.getComponentShortName = function(componentName) {
    var shortName = "";
    for (var i = 0; i != componentName.length; i++) {
      var character = componentName[i];
      if (character == character.toUpperCase() && character != ".")
        shortName += character;
    }
    return shortName;
  };

  this.getCurrentComponentPath = function() {
    return purgeSlashes(document.location.pathname.replace("/dyn/admin/nucleus", ""));
  };

  this.logTrace = function(msg) {
    if (isLoggingTrace) {
      console.log(msg);
    }
  };

  this.unique = function(array) {
    var n = {},
      r = [];
    for (var i = 0; i < array.length; i++) {
      if (!n[array[i]]) {
        n[array[i]] = true;
        r.push(array[i]);
      }
    }
    return r;
  };

  this.sort = function(array) {
    logTrace('beforeSort : ' + array);
    var sorted = array.sort(function(a, b) {
      if (a !== null)
        return a.localeCompare(b, 'en', {
          caseFirst: 'upper'
        });
      else if (b !== null)
        return -1;
      else
        return 0;
    });
    logTrace('after sort : ' + sorted);
    return sorted;
  };


  this.copyToClipboard = function(text) {
    GM_setClipboard(text);
    window.alert("Data has been added to your clipboard");
  };

  this.rotateArrow = function($arrow) {
    if ($arrow.hasClass("fa-arrow-down"))
      $arrow.removeClass("fa-arrow-down").addClass("fa-arrow-up");
    else
      $arrow.removeClass("fa-arrow-up").addClass("fa-arrow-down");
  };

  this.rotateArrowQuarter = function($arrow) {
    if ($arrow.hasClass("fa-arrow-down"))
      $arrow.removeClass("fa-arrow-down").addClass("fa-arrow-right");
    else
      $arrow.removeClass("fa-arrow-right").addClass("fa-arrow-down");
  };

  this.endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  this.buildSimpleTable = function(item, tableTemplate, rowTemplate) {
    var itemDesc = item.itemDescriptor;
    var id = item.id;
    var rows = [];
    var val;
    for (key in item) {
      if (key != 'id' && key != 'itemDescriptor') {
        rows.push(rowTemplate.format(key, item[key]));
      }
    }
    var table = tableTemplate.format(itemDesc, id, rows.join(''));

    return table;
  }

  this.convertAddItemToPlainObject = function($item) {
    var o = {};

    var itemDesc = $item.attr('item-descriptor');
    o.itemDescriptor = itemDesc;
    var id = $item.attr('id');
    o.id = id;
    $item.find('set-property').each(function() {
      var $row = $(this);
      o[$row.attr('name')] = $row.text();
    });

    return o;
  }

  this.index = function(obj, i) {
    return obj[i]
  }

  // if s = a.b.c, return o.a.b.c 
  this.subProp = function(o, s) {
    return s.split('.').reduce(index, o);
  }


  this.sanitizeXml = function(xmlContent) {
    var start = new Date().getTime();

    var regexp = /<\!--(.*)(<set\-property.*><\!\[CDATA\[[\S\s]*?\]\]\><\/set\-property\>).*-->/ig;
    var xmlStr = xmlContent.replace(regexp, function(str, p1, p2, offset, s) {
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
  };

  $.fn.outerHTML = function(s) {
    return (s) ? this.before(s).remove() : $("<p>").append(this.eq(0).clone()).html();
  }

  this.extendComponentPath = function(path) {
    var res = path;
    if (!path.startsWith('/dyn/admin/nucleus/')) {
      res = '/dyn/admin/nucleus/' + res;
    }
    if (!res.endsWith('/')) {
      res = res + '/';
    }
    return purgeSlashes(res);
  };

  $.fn.adjustToFit = function($parent, targetTotalSize, minSize) {
    var curSize = $parent.fullHeight();
    var delta = targetTotalSize - curSize;
    var hThis = parseFloat(this.css('height').replace('px', ''));
    hThis += delta;
    if (!isNull(minSize)) {
      hThis = Math.max(minSize, hThis);
    }
    this.setHeightAndMax(hThis);
    return this;
  }

  $.fn.fullHeight = function() {
    var h = parseFloat(this.css('height').replace('px', ''));
    var mBot = parseFloat(this.css('margin-bottom').replace('px', ''));
    var mTop = parseFloat(this.css('margin-top').replace('px', ''));
    var total = h + mTop + mBot;

    return total;
  }


  $.fn.innerHeight = function() {
    var h = parseInt(this.css('height').replace('px', ''));
    return h;
  }

  $.fn.setHeightAndMax = function(value) {
    this.css('max-height', value + 'px');
    this.css('height', value + 'px');
    return this;
  }

  $.fn.toCSV = function() {
    var data = [];
    $(this).find('tr').each(function(idx, elem) {
      $tr = $(elem);
      line = [];
       $tr.children('th').each(function() {
        line.push($(this).text());
      });

      $tr.children('td').each(function() {
        line.push($(this).text());
      });
      if(line.length >0){
        data.push(line);
      }

    });

    var linesText = [];
    for (var i = 0; i < data.length; i++) {
      linesText.push(data[i].join(';'));
    }

    var csv = linesText.join('\n');

    return csv;
  }

  /*

highlight v4

Highlights arbitrary terms.

<http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>

MIT license.

Johann Burkard
<http://johannburkard.de>
<mailto:jb@eaio.com>

*/

  $.fn.highlight = function(pat) {
    function innerHighlight(node, pat) {
      var skip = 0;
      if (node.nodeType == 3) {
        var pos = node.data.toUpperCase().indexOf(pat);
        if (pos >= 0) {
          var spannode = document.createElement('span');
          spannode.className = 'highlight';
          var middlebit = node.splitText(pos);
          var endbit = middlebit.splitText(pat.length);
          var middleclone = middlebit.cloneNode(true);
          spannode.appendChild(middleclone);
          middlebit.parentNode.replaceChild(spannode, middlebit);
          skip = 1;
        }
      } else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
        for (var i = 0; i < node.childNodes.length; ++i) {
          i += innerHighlight(node.childNodes[i], pat);
        }
      }
      return skip;
    }
    return this.length && pat && pat.length ? this.each(function() {
      innerHighlight(this, pat.toUpperCase());
    }) : this;
  };

  $.fn.removeHighlight = function() {
    return this.find("span.highlight").each(function() {
      this.parentNode.firstChild.nodeName;
      with(this.parentNode) {
        replaceChild(this.firstChild, this);
        normalize();
      }
    }).end();
  };

  console.log('bda.common.js initialized');
} catch (e) {
  console.log(e);
}