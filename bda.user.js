﻿﻿// ==UserScript==
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
// @grant GM_getResourceURL
// @grant GM_addStyle
// @grant window.focus
// @grant GM_setClipboard
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
//
// ------ write version on bdaCSS TOO ! ------
// @version 2.1
// @resource bdaCSS bda.css?version=2.1

// @require https://code.jquery.com/jquery-3.0.0.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.21.5/js/jquery.tablesorter.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/codemirror.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/mode/xml/xml.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/addon/hint/show-hint.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/addon/hint/xml-hint.min.js
// @require https://raw.githubusercontent.com/vkiryukhin/vkBeautify/master/vkbeautify.js
// @require https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.8.0/highlight.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/select2/3.5.2/select2.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/vis/4.15.0/vis.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js
// custom bootstrap
// @require lib/bootstrap/js/bootstrap.min.js
// @require http://twitter.github.io/typeahead.js/releases/latest/typeahead.bundle.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery.textcomplete/1.7.2/jquery.textcomplete.min.js

// @resource cmCSS https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/codemirror.css
// @resource tablesorterCSS https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.21.5/css/theme.blue.min.css
// @resource hljsThemeCSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/highlight.js/github_custom.css
// @resource hlCSS https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.8.0/styles/default.min.css
// @resource select2CSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/select2/select2.css
// @resource select2BootCSS https://cdnjs.cloudflare.com/ajax/libs/select2-bootstrap-css/1.4.6/select2-bootstrap.css
// @resource fontAwsomeCSS https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/lib/font-awsome/font-awesome.min.css
// @resource visCSS https://cdnjs.cloudflare.com/ajax/libs/vis/4.15.0/vis.min.css
// @resource cmHint https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/addon/hint/show-hint.css
// scoped bootstrap
// @resource bootstrapCSS lib/bootstrap/scoped-twbs.min.css
// @resource typeahead-bootstrapCSS https://raw.githubusercontent.com/bassjobsen/typeahead.js-bootstrap-css/master/typeaheadjs.css
// @resource whatsnew https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/WHATSNEW.md

// -- BDA plugins after all the libraries --
// @require bda.common.js
// @require bda.search.js
// @require bda.menu.js
// @require bda.toolbar.js
// @require bda.repository.js
// @require bda.pipeline.js
// @require bda.jdbc.js
// @require bda.perfmonitor.js
// @require bda.actor.js
// @require bda.storage.js
// @require bda.xmldef.js
// @require bda.compconfig.js
// @require bda.component.js
// @require parser/bda.dash.line.splitter.js
// @require parser/bda.dash.parser.js
// @require bda.dash.js
// @require bda.scheduler.js

// @updateUrl http://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
// @downloadUrl https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
// ==/UserScript==

// Insert CSS before domready event to speed the page rendering and avoid blink effect
var is_chrome = window.chrome;
// For FF, insert CSS as <link> tag
if (!is_chrome) {
    insertCss("cmCSS");
    insertCss("hlCSS");
    insertCss("hljsThemeCSS");
    insertCss("tablesorterCSS");
    insertCss("fontAwsomeCSS");
    insertCss("select2CSS");
    insertCss("select2BootCSS");
    insertCss("bootstrapCSS");
    insertCss("typeahead-bootstrapCSS");
    insertCss("bdaCSS");
    insertCss("visCSS");
    insertCss("cmHint");
}
// For Chrome inject <style> tag : this better because of the implemention of GM_getResourceURL in Tampermonkey (base64 transformation)
else {
    injectCss();
}
function insertCss(resourceName) {
  $("<link />").attr("href", GM_getResourceURL(resourceName)).attr("rel", "stylesheet").attr("type","text/css").appendTo("head");
}

function injectCss()
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
    var bootstrapCSS = GM_getResourceText("bootstrapCSS");
    GM_addStyle(bootstrapCSS);
    var typeaheadbootstrapCSS = GM_getResourceText("typeahead-bootstrapCSS");
    GM_addStyle(typeaheadbootstrapCSS);
    var bdaCSS = GM_getResourceText("bdaCSS");
    GM_addStyle(bdaCSS);
    var visCSS = GM_getResourceText("visCSS");
    GM_addStyle(visCSS);
    try{

     var cmHint = GM_getResourceText("cmHint");
    GM_addStyle(cmHint);
    }catch(e){
      console.error(e);
    }
}

jQuery(document).ready(function() {
  (function($) {
    var BDA = {
      componentBrowserPageSelector : "h1:contains('Component Browser')",
      logoSelector : "div#oracleATGbrand",
      oldDynamoAltSelector : ["Dynamo Component Browser", "Dynamo Administration", "Performance Monitor", "Dynamo Batch Compiler", "Dynamo Configuration", "JDBC Browser"],
      isOldDynamo : false,
      isComponentPage : false,
      dynAdminCssUri : "/dyn/admin/atg/dynamo/admin/admin.css",

      init : function()
      {
        console.time('bda');
        console.log("Start BDA script");
        BDA.isOldDynamo = this.isOldDynamoFct();
        BDA.isComponentPage = this.isComponentPageFct();

        if (BDA.isOldDynamo)
        {
          console.log('isOldDynamo')
          BDA.logoSelector = "";
          for (var i = 0; i != BDA.oldDynamoAltSelector.length; i++)
          {
            if(i !== 0)
             BDA.logoSelector += ",";
            BDA.logoSelector += "img[alt='" + BDA.oldDynamoAltSelector[i] + "']";
          }
          console.log("OldDynamo logoSelector :" + BDA.logoSelector);
          this.fixCss();
        }
        console.log("Path : " + purgeSlashes($(location).attr('pathname')));
        console.log("isComponentPage : " + BDA.isComponentPage + " IsOldDynamo : " + BDA.isOldDynamo);

        $.tablesorter.defaults.sortInitialOrder = 'desc';

        // Setup storage plugin
        $().bdaStorage();
        // Setup Repository plugin
        $().bdaRepository(BDA);
        // Setup pipeline plugin
        $().bdaPipeline();
        // Setup XML definition plugin
        $().bdaXmlDef();
        // Setup component configuration plugin
        $().bdaCompConfig();
        // Setup perf monitor plugin
        $().bdaPerfMonitor();
        // Setup JDBC browser plugin
        $().bdajdbc();
        // Setup actor plugin
        $().bdaActor();
        // Setup toolbar plugin
        $().bdaToolbar(BDA);
        // Setup Menu plugin
        $().bdaMenu({});
        // Setup DASH
        $().initDASH(BDA);

        $().bdaScheduler();

        var autocomplete = $.fn.bdaStorage.getBdaStorage().getConfigurationValue('search_autocomplete');
        autocomplete = (autocomplete == true) ? true : false;
        if (autocomplete) {
          $("#searchField").bdaSearch();
        }

        if (this.isComponentPage)
        {
          // Change page title
          BDA.setupPageTitle();

          // Setup find class link
          BDA.setupFindClassLink();

          BDA.setupCopyClipboardButtons();

          // Make search field visible
          $("#search").css("display", "inline");
        }
        BDA.bindEscapeKey();
        // Monitor execution time
        console.timeEnd('bda');
      },

      bindEscapeKey : function()
      {
        // Handle escape key press
        $(document).keyup(function(e) {
          if (e.keyCode == 27) {
            // Close add component pop-up
            $('.popup_block').fadeOut();
            // Close panels
            if ($("#bdaBackupPanel").css("display") != "none")
            {
              $("#bdaBackupPanel").slideToggle();
              rotateArrow($(".backupArrow i"));
            }
            if ($("#bdaBugPanel").css("display") != "none")
            {
              $("#bdaBugPanel").slideToggle();
              rotateArrow($(".backupArrow i"));
            }
         }
        });
      },

      setupFindClassLink : function()
      {
        var $classLink = null;
        if (BDA.isOldDynamo)
          $classLink = $("h1:eq(0)").next();
        else
         $classLink = $("h1:eq(1)").next();
        var className = $classLink.text();
        $("<span style='margin-left : 25px'><a href='/dyn/dyn/findclass.jhtml?className="+className+"&debug=true'>Find Class</a></span>") .insertAfter($classLink);
      },


      setupCopyClipboardButtons: function() {
        logTrace('setupCopyClipboardButtons');
        var $componentBreadCrumb = null;
        if (BDA.isOldDynamo)
          $componentBreadCrumb = $("h1:eq(0)");
        else
          $componentBreadCrumb = $("h1:eq(1)");

        if (!isNull($componentBreadCrumb)) {
          $componentBreadCrumb
            .attr('id', 'breadcrumb')
            .append($('<button></button', {
                class: 'bda-button bda-button-clipboard',
                html: '<i class="fa fa-files-o"></i>'
              })
              .on('click', function() {
                copyToClipboard(getCurrentComponentPath());
              })
            );
          var $classLink = $componentBreadCrumb.next();
          $('<button></button', {
              class: 'bda-button bda-button-clipboard',
              html: '<i class="fa fa-files-o"></i>'
            })
            .on('click', function() {
              copyToClipboard($classLink.text());
            }).insertAfter($classLink);
        }
      },

      //--- Page informations ------------------------------------------------------------------------

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
        if ($("link[href='" + BDA.dynAdminCssUri + "']").length === 0)
        {
          console.log("Default dyn admin CSS is missing : " + BDA.dynAdminCssUri + ". Add it now.");
          var $link = $("<link />")
          .prop("href", BDA.dynAdminCssUri)
          .prop("type", "text/css")
          .prop("rel", "stylesheet");
          if($('head').size > 0)
            $('head').append($link);
          else
            $('body').append($link);
        }
      },

      isComponentPageFct : function ()
      {
        return $("h1:contains('Directory Listing')").length === 0 //Page is not a directory
        && document.URL.indexOf('/dyn/admin/nucleus/') != -1 // Page is in nucleus browser
        && document.URL.indexOf("?") == -1; // Page has no parameter
      },

      setupPageTitle : function()
      {
        $("title").text(getComponentNameFromPath(getCurrentComponentPath()));
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
