//Primary anonymous wrapper to ensure that this section will be executed only once.

try {

  var isLoggingTrace = false;
  var isLoggingInfo = true;
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


  String.prototype.trunc =
    function(n) {
      return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
    };

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
      logTrace('buildTagsFromArray ' + JSON.stringify(tags));
      return tags;
    },

    this.processRepositoryXmlDef = function(property, callback, componentPath) {
      console.time('processRepositoryXmlDef');
      if (callback !== undefined) {
        // First check cache value if any
        if (_.isNil(componentPath)) {
          componentPath = getCurrentComponentPath();
        }
        var rawXmlDef = getXmlDef(componentPath);
        if (rawXmlDef !== null) {
          logTrace("Getting XML def from cache");
          var xmlDoc = jQuery.parseXML(rawXmlDef);
          console.timeEnd('processRepositoryXmlDef');
          if (callback !== undefined){
            callback($(xmlDoc));
          }
        }
        // If no cache entry, fetch the XML def in ajax
        else {
          var url = location.protocol + '//' + location.host + '/dyn/admin/nucleus' + componentPath + "?propertyName=" + property;
          logTrace(url);
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
                  logTrace("XML def length : " + rawXmlDef.length);
                  var xmlDoc = jQuery.parseXML(rawXmlDef);
                  storeXmlDef(componentPath, rawXmlDef);
                  console.timeEnd('processRepositoryXmlDef');
                  callback($(xmlDoc));
                } catch (err) {
                  logTrace("Unable to parse XML def file !");
                  console.timeEnd('processRepositoryXmlDef');
                  callback(null);
                  logTrace(err);
                }
              } else{

                console.timeEnd('processRepositoryXmlDef');
                callback(null);
              }
            },
          });
        }
      }
    };

  this.getXmlDef = function(componentPath) {
    console.time('getXmlDef');
    logInfo("Getting XML def for : " + componentPath);
    var timestamp = Math.floor(Date.now() / 1000);
    var xmlDefMetaData = JSON.parse(localStorage.getItem("XMLDefMetaData"));
    if (!xmlDefMetaData){
          console.timeEnd('getXmlDef');
      logInfo("getXmlDef Xml is null");
      return null;
      
    }
    if (xmlDefMetaData.componentPath != componentPath || (xmlDefMetaData.timestamp + xmlDefinitionCacheTimeout) < timestamp) {
        console.timeEnd('getXmlDef');
      logInfo("getXmlDef Xml def is outdated or from a different component");
      return null;
    }
    let xml = localStorage.getItem("XMLDefData");
        console.timeEnd('getXmlDef');
      logInfo("getXmlDef returning value from storage");
    console.timeEnd('getXmlDef');
    return xml;
  };

  this.storeXmlDef = function(componentPath, rawXML) {
    logTrace("Storing XML def : " + componentPath);
    var timestamp = Math.floor(Date.now() / 1000);

    localStorage.setItem("XMLDefMetaData", JSON.stringify({
      componentPath: componentPath,
      timestamp: timestamp
    }));
    localStorage.setItem("XMLDefData", rawXML);
  };

  this.highlightAndIndentXml = function($elm) {
    traceTime("highlightAndIndentXml");
    logTrace("Start highlightAndIndentXml");

    $elm.each(function(index) {
      var escapeXML = $(this).html();
      var unescapeXML = $('<div/>').html(escapeXML).text();
      // vkbeautify needs unescape XML to works
      unescapeXML = vkbeautify.xml(unescapeXML, 2);
      var $codeBlock = $(this)
        // remove previous XML content
        .empty()
        // add code tags
        .append("<code class='xml'></code>")
        .find("code")
        // set escape XML content, because highlight.js needs escape XML to works
        .text(unescapeXML);

      // Run highlight.js on each XML block
      logTrace($codeBlock.get(0));
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

    traceTimeEnd("highlightAndIndentXml");
  };

  this.getComponentNameFromPath = function(componentPath) {
    // Strip last slash if any
    if (componentPath[componentPath.length - 1] == "/")
      componentPath = componentPath.substr(0, componentPath.length - 1);

    var tab = componentPath.split("/");
    //logTrace("For component :" + componentPath + ", name is : " + (tab[tab.length - 1]));
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

  this.logTrace = function() {
    if (isLoggingTrace && window.console != undefined) {
      window.console.log.apply(window.console, arguments);
    }
  };
   this.logInfo = function() {
    if (isLoggingInfo && window.console != undefined) {
      window.console.log.apply(window.console, arguments);
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

  this.stringCompare = function(a, b) {
    if (a !== null)
      return a.localeCompare(b, 'en', {
        caseFirst: 'upper'
      });
    else if (b !== null)
      return -1;
    else
      return 0;
  };

  this.compareAttr = function(a, b, attr) {
    var aVal = $(a).attr(attr);
    var bVal = $(b).attr(attr);
    return stringCompare(aVal, bVal);
  }

  this.compareAttrFc = function(attr) {
    return function(a, b) {
      return compareAttr(a, b, attr);
    }
  }

  this.sort = function(array) {
    logTrace('beforeSort : ' + array);
    var sorted = array.sort(this.stringCompare);
    logTrace('after sort : ' + sorted);
    return sorted;
  };


  this.copyToClipboard = function(text) {
    GM_setClipboard(text);
    $.notify(
      "Data has been added to your clipboard", {
        position: "top center",
        className: "success"
      }
    );
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
  };

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
  };

  this.index = function(obj, i) {
    return obj[i];
  };

  // if s = a.b.c, return o.a.b.c
  this.subProp = function(o, s) {
    return s.split('.').reduce(index, o);
  };


  this.sanitizeXml = function(xmlContent) {
    console.time("sanitizeXml");

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
    console.timeEnd("sanitizeXml");
    return xmlStr;
  };

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

  this.traceTime = function(name) {
    if (isLoggingTrace) {
      console.time(name)
    }
  };

  this.traceTimeEnd = function(name) {
    if (isLoggingTrace) {
      console.timeEnd(name)
    }
  };

  this.colorToCss = function(colors) {
    var cssVal = "rgb(";
    for (var i = 0; i < colors.length; i++) {
      if (i !== 0)
        cssVal += ",";
      cssVal += colors[i];
    }
    cssVal += ")";
    return cssVal;
  };

  this.verifyColor = function(colors) {
    for (var i = 0; i < colors.length; i++)
      if (colors[i] > 210)
        colors[i] = 210;
    return colors;
  };

  this.stringToColour = function(str) {
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
  };

  $.fn.outerHTML = function(s) {
    return (s) ? this.before(s).remove() : $("<p>").append(this.eq(0).clone()).html();
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
  };

  $.fn.fullHeight = function() {
    var h = parseFloat(this.css('height').replace('px', ''));
    var mBot = parseFloat(this.css('margin-bottom').replace('px', ''));
    var mTop = parseFloat(this.css('margin-top').replace('px', ''));
    var total = h + mTop + mBot;

    return total;
  };


  $.fn.innerHeight = function() {
    var h = parseInt(this.css('height').replace('px', ''));
    return h;
  };

  $.fn.setHeightAndMax = function(value) {
    this.css('max-height', value + 'px');
    this.css('height', value + 'px');
    return this;
  };
  $.fn.scrollTo = function() {

    $(this).get()[0].scrollIntoView({
      behavior: "smooth"
    });

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
      if (line.length > 0) {
        data.push(line);
      }

    });

    var linesText = [];
    for (var i = 0; i < data.length; i++) {
      linesText.push(data[i].join(';'));
    }

    var csv = linesText.join('\n');

    return csv;
  };

  $.fn.sortContent = function(selector, sortFunction) {
    var $this = $(this);
    var $elems = $this.find(selector);
    logTrace('selector ' + selector);
    logTrace($elems.length);
    $elems = $elems.sort(sortFunction);
    $elems.detach().appendTo($this);
    return this;
  }

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };


  // compare two versions, return true if local is up to date, false otherwise
  // if both versions are in the form of major[.minor][.patch] then the comparison parses and compares as such
  // otherwise the versions are treated as strings and normal string compare is done
  var VPAT = /^\d+(\.\d+){0,2}$/;

  function versionUpToDate(local, remote) {
    if (!local || !remote || local.length === 0 || remote.length === 0)
      return false;
    if (local == remote)
      return true;
    if (VPAT.test(local) && VPAT.test(remote)) {
      var lparts = local.split('.');
      while (lparts.length < 3)
        lparts.push("0");
      var rparts = remote.split('.');
      while (rparts.length < 3)
        rparts.push("0");
      for (var i = 0; i < 3; i++) {
        var l = parseInt(lparts[i], 10);
        var r = parseInt(rparts[i], 10);
        if (l === r)
          continue;
        return l > r;
      }
      return true;
    } else {
      return local >= remote;
    }
  }

  function getEvenOddClass(i) {
    return (i % 2 === 0) ? 'even' : 'odd';
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


  (function($) {
    // CUSTOM ALERT with multiple options
    const BDA_ALERT_CONFIG = {};
    const bdaAlertDefaults = {
      msg: '',
      options: []
    };
    const pluginName = "bdaAlert";

    const templates = {
      ALERT_MODAL_TEMPLATE: '<div  class="bda-alert-wrapper twbs">' +
        '<div class="modal fade bda-modal" tabindex="-1" role="dialog">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content ">' +
        '<div class="modal-body bda-alert-body"></div>' +
        '<div class="modal-footer bda-alert-footer"></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
    };

    function BdaAlert(parent, inOptions) {
      // logTrace('BdaAlert');
      //logTrace(parent)
      this.$parent = $(parent);

      logTrace('in options: %s', JSON.stringify(inOptions));

      this.options = inOptions //$.extend({}, bdaAlertDefaults, inOptions);
      logTrace('options:');
      logTrace(this.options);
      this._defaults = bdaAlertDefaults;
      this._name = pluginName;

      this._init();
    }

    BdaAlert.prototype = {
      _init: function() {
        logTrace('build bdaAlert');
        logTrace(arguments)
        logTrace(this.$parent.get());

        this.wrapper = $(templates.ALERT_MODAL_TEMPLATE);
        this.$parent.append(this.wrapper);
        this.modal = this.wrapper.find('.modal');
      },
      _show: function() {
        logTrace('bdaAlert show');
        this.modal.modal('show');
      },
      _hide: function() {
        logTrace('bdaAlert hide');
        this.modal.modal('hide');
        this._destroy();
      },
      _destroy: function() {
        logTrace('bdaAlert destroy');
        this.wrapper.detach();
      },
      confirm: function() {
        var plugin = this;
        var opts = plugin.options;
        logTrace('bdaAlert confirm');
        logTrace(opts);
        //set msg
        plugin.modal.find('.bda-alert-body').html(opts.msg);
        if (!_.isNil(opts.width)) {
          plugin.modal.find('.modal-dialog').width(opts.width);
        }
        //clean
        var $footer = plugin.modal.find('.bda-alert-footer').empty();

        var buildOuterCallback = function(callback) {
          return function() {
            logTrace('bdaAlert click');
            logTrace(callback);
            if (!isNull(callback)) {
              callback.apply(this.$modal);
            }
            plugin._hide();

          }
        }

        for (var i = 0; i < opts.options.length; i++) {
          var opt = opts.options[i];
          logTrace(opt);

          $('<input></input>', {
              type: 'button',
              value: opt.label,
              class: 'btn btn-default',
              data: opts.options[i]
            })
            .on('click', buildOuterCallback(opt._callback))
            .appendTo($footer);
        }
        plugin._show();
      }
    }

    $.fn[pluginName] = function(options) {
      logTrace('in function bdaAlert');
      try {

        logTrace("call " + pluginName);
        logTrace(options);

        return this.each(function() {

          var data = new BdaAlert(this, options);
          data.confirm();

        });
      } catch (e) {
        console.error(e);
      }
      return this;
    }

    $.fn.flash = function(options) {
      let $this = $(this);
      this.addClass("flash");
      setTimeout(function() {
        $this.removeClass("flash");
      }, 3000);

      return this;
    }


    // lodash mixin to sort an js object by keys
    _.mixin({
      'sortKeysBy': function(object, comparator) {

        const keys = Object.keys(object)
        const sortedKeys = _.sortBy(keys, comparator)

        return _.fromPairs(
          _.map(sortedKeys, key => [key, object[key]])
        )

      }
    });

    PerformanceMonitor = function(active){
      this.active = active;
      this.values = {};
    }
    PerformanceMonitor.prototype.reset = function(){
      this.values = {};
    }
    PerformanceMonitor.prototype.start = function(task){
      if(this.active){

      let record = this.values[task];
      if(_.isNil(record)){
         record = {total:0,occurences:0};
        this.values[task] = record;
      }
      record.start = new Date().getTime();
     //  console.log('start',task,record.start);
      }
    }
    PerformanceMonitor.prototype.cumul = function(task){
      if (this.active){
        let record = this.values[task];
          if(!!record && !!record.start){
            let current = new Date().getTime() - record.start;
            record.total += current;
            record.occurences++;
         //    console.log('cumul',task,record.start,record.total,current);
          }
        }
    }
    PerformanceMonitor.prototype.log = function(){
      console.log('PerformanceMonitor :');
      _.forEach(this.values,(record,task)=>{
        let average = record.total / record.occurences;
        console.log('%s - total : %s, average : %s, occurences %s',task,record.total, average,record.occurences);
      })
    }

  })(jQuery);


} catch (e) {
  logTrace(e);
}