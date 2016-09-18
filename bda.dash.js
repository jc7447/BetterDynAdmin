// DASH DynAdmin SHell
"use strict";
jQuery(document).ready(function() {
  (function($) {

    var BDA;
    var BDA_STORAGE;
    var BDA_DASH = {

      devMode: false,
      version: 0.7,

      settings: {
        domain: "",
        verbose: false,
        silent: false,
      },
      // dom elements
      $screen: null,
      $input: null,
      $modal: null,
      $footer: null,

      modalHeight: 200,
      modalHeightRatio: 0.9,
      //
      initialized: false,

      hist_persist_size: 15,
      histIdxOffset: 0,

      styles: {
        debug: "muted",
        info: "info",
        success: "success",
        warning: "warning",
        error: "danger",
        hidden: "hidden"
      },
      keyword_this: "this",
      templates: {
        consoleModal: '<div class="twbs">' +
          '<div id="dashModal" class="modal fade" tabindex="-1" role="dialog" data-fullscreen="false">' +
          '<div id="dashModalDialog" class="modal-dialog modal-lg">' +
          '<div class="modal-content">' +
          '<div class="modal-header">' +
          '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span >&times;</span></button>' +
          '<h4 class="modal-title">DASH - DynAdmin SHell - v{0}</h4>' +
          '</div>' +
          '<div class="modal-body">' +
          '<div class="container-fluid">' +
          '<div id="dashInnerBody" class="row">' +
          '<div id="dashScreen" class="dashcol col-lg-12" >' +
          '' +
          '<div id="" class="progress" style="display:none;" >' +
          '<div id="dashProgressBar" class="progress-bar  progress-bar-success" " role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="">' +
          '</div>' +
          '</div>' +
          '</div>' +
          '<div id="dashControl" class="tab-content dashcol col-lg-12">' +
          '<div role="tabpanel" class="tab-pane fade in active" id="dash-console-tab">' +
          '<form id="dashForm" class="">' +
          '<div class="form-group">' +
          '<div class="input-group">' +
          '<div class="input-group-addon"><span id="dash_dollar">$</span><i class="fa fa-spinner fa-spin" id="dash_spinner" style="display: none;"></i></div>' +
          '<input type="text" class="form-control dash-input main-input" id="dashInput" placeholder="" name="cmd" data-provide="typeahead" autocomplete="off"/>' +
          '<span  class="input-group-btn"><button type="button" id="dashCleanInput" class="btn btn-default">&times;</button></span>' +
          '</div>' +
          '</div>' +
          '</form>' +
          '</div>' +
          '<div role="tabpanel" class="tab-pane fade" id="dash-editor-tab">' +
          '<form id="dashEditorForm" class="form-horizontal">' +
          '<div class="form-group top-row">' +
          '<div class="col-sm-3">' +
          '<select id="dashEditorScriptList" class="form-control">' +
          '</select>' +
          '</div>' +
          '<div class="col-sm-5">' +
          '<div class="btn-group" role="group" >' +
          /*'<button type="button" id="dashLoadScript" class="btn btn-primary" title="load">' +
          '<i class="fa fa-folder-open" />&nbsp;' +
          '</i>' +
          '</button>' +*/
          '<button type="button" id="dashDeleteScript" class="btn btn-primary" title="delete">' +
          '<i class="fa fa-trash-o" />&nbsp;' +
          '</i>' +
          '</button>' +
          '<button type="button" id="dashRunEditor" class="btn btn-primary" title="run">' +
          '<i class="fa fa-play" />&nbsp;' +
          '</i>' +
          '</button>' +
          '<button type="button" id="dashSaveEditor" class="btn btn-primary" title="save">' +
          '<i class="fa fa-floppy-o" />&nbsp;' +
          '</i>' +
          '</button>' +
          '<button type="button" id="dashClearEditor" class="btn btn-primary" title="clear">' +
          '<i class="fa fa-eraser" />&nbsp;' +
          '</i>' +
          '</button>' +
          '</div>' +
          '</div>' +
          '<label for="dashSaveScriptName" class="col-sm-1 control-label">Name</label>' +
          '<div class="col-sm-3">' +
          '<input type="text" class="form-control dash-input main-input" id="dashSaveScriptName" placeholder="Name" name="save" autocomplete="off"></input>' +
          '</div>' +
          '</div>' +
          '<div class="form-group middle-row">' +
          '<div class="col-sm-12">' +
          '<textarea id="dashEditor" class="form-control dash-input main-input" rows="12  " placeholder=""></textarea>' +
          '</div>' +
          '</div>' +
          '</form>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '<div id="dashFooter" class="modal-footer">' +
          '<ul class="nav nav-pills">' +
          '<li role="presentation" class="active"><a id="dashConsoleButton" href="#dash-console-tab" aria-controls="console" role="tab" data-toggle="tab" data-fs-mode="false">Console</a></li>' +
          '<li role="presentation"><a id="dashEditorButton"  href="#dash-editor-tab" aria-controls="editor" role="tab" data-toggle="tab"  data-fs-mode="true">Editor</a></li>' +
          '<li role="presentation" class="pull-right footer-right" ><a id="dashClearScreen" class="btn-default"   role="tab" aria-controls="clearScreen" >Clear Screen <i class="fa fa-ban" ></i></a></li>' +
          '</ul>' +
          '<div id="dashTips" class="text-muted"></div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>',
        screenLine: '<div class="dash_screen_line alert alert-{1} alert-dismissible" role="alert" data-command="">' +
          '<div class="btn-group" role="group">' +
          '<button type="button" class="btn btn-{1} dash_redo"  aria-label="Redo"><i class="fa fa-repeat" ></i></button>' +
          '<button type="button" class="btn btn-{1} dash_save" aria-label="Save" aria-pressed="false" style="display:none;" >' +
          '<i class="fa fa-floppy-o" ></i>' +
          '<input type="checkbox" class="innerCheckbox hidden"/>' +
          '</button>' +
          '<button type="button" class="btn btn-{1} dash_clipboard"  aria-label="Redo"><i class="fa fa-copy" ></i></button>' +
          '<button type="button" class="btn btn-{1} dash_close" data-dismiss="alert" aria-label="Close"><i class="fa fa-times" ></i></button>' +
          '</div>' +
          '<p class="dash_feeback_line">$&gt;&nbsp;<span class="cmd"></span></p>' +
          '<p class="dash_log_line">{2}</p>' +
          '<p class="dash_return_line">{0}</p>' +
          '</div>',
        systemResponse: '<div class="dash_screen_sys_res alert alert-{1} alert-dismissible" role="alert" >' +
          '<div class="btn-group" role="group">' +
          '<button type="button" class="btn btn-{1} dash_close" data-dismiss="alert" aria-label="Close"><i class="fa fa-times" /></button>' +
          '</div>' +
          '<p class="dash_return_line">{0}</p>' +
          '</div>',
        not_implemented: 'This command is not implemented yet.',
        helpMain: '<div><h5>References:</h5><ul>' +
          '<li>Save the result of a command to a variable using ">varName"</li>' +
          '<li>Reference to variable : $varName</li>' +
          '<li>Reference to component : @FAV - where FAV is the shortname of a bookmarked component, ex @OR : OrderRepository.</li>' +
          '<li>Reference to current component : @this</li>' +
          '</ul>' +
          '<div><h5>Keyboard Shortcuts:</h5>' +
          '<dl class="dl-horizontal">' +
          '<dt>CTRL+C</dt><dd>Clears the console input - only if no text is selected</dd>' +
          '<dt>CTRL+L</dt><dd>Clears the screen, in either the console or the editor</dd>' +
          '<dt>CTRL+ENTER</dt><dd>In editor, runs the selected text, or the whole textarea if nothing is selected</dd>' +
          '<dt>CTRL+ALT+T</dt><dd>Opens this console</dd>' +
          '</dl>' +
          '</div>' +
          '<p>For more information go to the <a target="_blank"  href="https://github.com/jc7447/BetterDynAdmin/wiki/Dash">github wiki</a></p>' +
          '</div>',
        tips: [
          'You can open Dash by using the shortcut <kbd>ctrl + alt + T</kbd>',
          'Submit the editor content by pressing <kbd>alt + enter</kbd>',
          'Use @this to reference the current component',
          'Use @SHORT to reference a component that has been favorited',
          'Type help to try to get some help',
          'All your base are belong to us.'
        ],
        menuElem: '<div id="bdaDashMenuElem" class="menu" title="ctrl+alt+T"><p>Dash</p><div class="menuArrow"><i class="fa fa-terminal" /></div></div>',
        errMsg: '<strong>{0}</strong> : {1}<br/> Type <em>help</em> for more information.',
        tableTemplate: '<table class="table"><tr><th>{0}</th><th>{1}</th></tr>{2}</table>',
        rowTemplate: '<tr><td>{0}</td><td>{1}</td></tr>',
        printItemTemplate: '<div class="panel panel-default printItem"><div class="panel-heading">Printing item with id: {0}</div>{1}</div>',
        editorScriptLine: '<option value="{0}">{1}</option>'
      },

      defaultParams: [{
        name: "output",
        type: "output",
        required: false
      }],

      flagsParamDef: [{
        name: "flags",
        type: "flags",
        required: false
      }],

      HIST: [],
      typeahead_base: [],
      //to sync multiple methods
      STACK: [],
      LOG: [],
      logLevels: {
        debug: {
          name: 'debug',
          value: 0
        },
        info: {
          name: 'info',
          value: 1
        },
        warning: {
          name: 'warning',
          value: 2
        },
        error: {
          name: 'error',
          value: 3
        },

      },
      progress: {
        total: 0,
        current: 0
      },
      flags: {
        SILENT: 's',
        SKIP_HISTORY: 'k',
        VERBOSE: 'v'
      },
      //references to components
      COMP_REFS: {},
      //variables
      VARS: {},
      //shell fonctions
      FCT: {

        //get /atg/commerce/order/OrderRepository.repositoryName >toto
        get: {

          commandPattern: '(/some/Component|@SHORT).propertyName',
          help: 'Return the value of /some/Component.propertyName',
          paramDef: [{
            name: "componentProperty",
            type: "componentProperty"
          }],

          main: function(params, callback, errCallback) {

            BDA_COMPONENT.getProperty(
              BDA_DASH.settings.domain,
              params.componentProperty.path,
              params.componentProperty.property,
              function(value) {
                callback(value);
              },
              function(jqXHR, textStatus, errorThrown) {
                errCallback({
                  name: textStatus,
                  message: errorThrown
                });
              });
          },

          responseToString: function(params, returnValue) {
            return returnValue;
          }
        },

        //set /atg/commerce/order/OrderRepository.loggingError false
        set: {

          commandPattern: '(/some/Component|@SHORT).propertyName value',
          help: 'sets the value of <em>/some/Component.propertyName</em> to <em>value</em>',
          paramDef: [{
            name: "componentProperty",
            type: "componentProperty"
          }, {
            name: "value",
            type: "value"
          }],
          main: function(params, callback, errCallback) {
            BDA_COMPONENT.setProperty(
              BDA_DASH.settings.domain,
              params.componentProperty.path,
              params.componentProperty.property,
              params.value,
              function(value) {
                callback(value);
              },
              function(jqXHR, textStatus, errorThrown) {
                errCallback({
                  name: textStatus,
                  message: errorThrown
                });
              }
            );
          },
          responseToString: function(params, retval) {
            return retval;
          }
        },

        go: {

          commandPattern: '/some/Component|@SHORT',
          help: 'redirects to the component page',
          paramDef: [{
            name: "component",
            type: "component"
          }],
          main: function(params, callback, errCallback) {

            BDA_DASH.goToComponent(params.component);
          }
        },

        echo: {

          commandPattern: 'value|@SHORT|$var',
          help: 'returns the value of a variable or a reference or a plain value',
          paramDef: [{
            name: "value",
            type: "value"
          }],
          main: function(params, callback, errCallback) {
            var value = params.value;
            callback(value);
          },

          responseToString: function(params, retval) {
            return JSON.stringify(retval);
          }
        },

        vi: {
          commandPattern: '',
          help: 'Text editor',
          main: function(params, callback, errCallback) {
            var value = "Just kidding ;)";
            callback(value);
          },
          responseToString: function(params, retval) {
            return retval;
          }
        },

        //print @OR order p92133231
        print: {

          commandPattern: ' /some/Repo|@SHORT itemDescriptor id',
          help: 'return the result of a print-item',
          paramDef: [{
            name: "repo",
            type: "component"
          }, {
            name: "itemDesc",
            type: "value"
          }, {
            name: "id",
            type: "value"
          }],
          main: function(params, callback, errCallback) {
            if (BDA_DASH.settings.domain !== "") {
              BDA_DASH.log("Using other domain {0}".format(BDA_DASH.settings.domain), BDA_DASH.logLevels.info);
            }
            $().executePrintItem(
              BDA_DASH.settings.domain,
              params.itemDesc,
              params.id,
              params.repo,
              function($xmlDoc) {
                try {
                  var res = "";
                  var items = []
                  if (!isNull($xmlDoc)) {
                    var $itemXml;
                    $xmlDoc.find('add-item').each(function() {
                      $itemXml = $(this);
                      items.push(convertAddItemToPlainObject($itemXml));
                    })
                    callback(items);
                  } else {
                    throw {
                      name: "Not Found",
                      message: "No value"
                    }
                  }
                } catch (e) {
                  errCallback(e);
                }
              },
              function(jqXHR, textStatus, errorThrown) {
                errCallback({
                  name: textStatus,
                  message: errorThrown
                });
              }
            );
          },
          responseToString: function(params, retval) {
            var res = "";
            for (var i = 0; i < retval.length; i++) {
              var item = retval[i];
              res += BDA_DASH.templates.printItemTemplate.format(item.id, buildSimpleTable(item, BDA_DASH.templates.tableTemplate, BDA_DASH.templates.rowTemplate));
            }
            return res;
          }
        },

         //print @OR order p92133231
        query: {

          commandPattern: ' /some/Repo|@SHORT itemDescriptor {query}',
          help: 'return the result of a query-items',
          paramDef: [{
            name: "repo",
            type: "component"
          }, {
            name: "itemDesc",
            type: "value"
          }, {
            name: "query",
            type: "value"
          }],
          main: function(params, callback, errCallback) {
            if (BDA_DASH.settings.domain !== "") {
              BDA_DASH.log("Using other domain {0}".format(BDA_DASH.settings.domain), BDA_DASH.logLevels.info);
            }
            $().executeQueryItems(
              BDA_DASH.settings.domain,
              params.itemDesc,
              params.query,
              params.repo,
              function($xmlDoc) {
                try {
                  var res = "";
                  var items = []
                  if (!isNull($xmlDoc)) {
                    var $itemXml;
                    $xmlDoc.find('add-item').each(function() {
                      $itemXml = $(this);
                      items.push(convertAddItemToPlainObject($itemXml));
                    })
                    callback(items);
                  } else {
                    throw {
                      name: "Not Found",
                      message: "No value"
                    }
                  }
                } catch (e) {
                  errCallback(e);
                }
              },
              function(jqXHR, textStatus, errorThrown) {
                errCallback({
                  name: textStatus,
                  message: errorThrown
                });
              }
            );
          },
          responseToString: function(params, retval) {
            var res = "";
            for (var i = 0; i < retval.length; i++) {
              var item = retval[i];
              res += BDA_DASH.templates.printItemTemplate.format(item.id, buildSimpleTable(item, BDA_DASH.templates.tableTemplate, BDA_DASH.templates.rowTemplate));
            }
            return res;
          }
        },



        rql: {

          commandPattern: '(/some/Repo|@SHORT)(.saveQuery | { xmlText })',
          help: 'executes the xmlText between brackets or a saved query',
          paramDef: [{
            name: "componentProperty",
            type: "componentProperty",
            required: false
          }, {
            name: "repo",
            type: "component",
            required: false
          }, {
            name: "xmlText",
            type: "value",
            required: false
          }, {
            name: "queryParams",
            type: "array",
            required: false
          }],

          main: function(params, callback, errCallback) {

            logTrace('rql function:');
            logTrace(JSON.stringify(params));

            var xmlText, repo;
            if (!isNull(params.componentProperty)) {
              repo = params.componentProperty.path;
              var queryName = params.componentProperty.property;
              var savedQuery = BDA_STORAGE.getQueryByName(repo, queryName);
              if (isNull(savedQuery)) {
                throw {
                  name: 'InvalidName',
                  message: 'No saved query by the name {0} in repo {1}'.format(queryName, repo)
                }
              } else {
                xmlText = savedQuery.query;
              }
            } else if (!isNull(params.repo) && !isNull(params.xmlText)) {
              repo = params.repo;
              xmlText = params.xmlText;
            } else {
              throw {
                name: 'MissingParameters',
                message: 'Missing repository and request parameters'
              }
            }

            if (params.queryParams != null) {
              console.log('params.queryParams:');
              console.log(params.queryParams);
              xmlText = BDA_DASH.formatRql(xmlText, params.queryParams);
              //expand the params
            }

            logTrace('repo : ' + repo);
            logTrace('xmlText : ' + xmlText);

            if (BDA_DASH.settings.domain !== "") {
              BDA_DASH.log("Using other domain {0}".format(BDA_DASH.settings.domain), BDA_DASH.logLevels.info);
            }

            $().executeRql(
              BDA_DASH.settings.domain,
              xmlText,
              repo,
              function($xmlDoc, head) {
                try {
                  var res = head.join('') + "\n";
                  if (!isNull($xmlDoc)) {
                    var $itemXml;
                    var items = [];
                    $xmlDoc.find('add-item').each(function() {
                      $itemXml = $(this);
                      items.push(convertAddItemToPlainObject($itemXml));
                    })
                    callback(items);
                  } else {
                    throw {
                      name: "Not Found",
                      message: "No value"
                    }
                  }
                } catch (e) {
                  errCallback(e);
                }
              },
              function(jqXHR, textStatus, errorThrown) {
                errCallback({
                  name: textStatus,
                  message: errorThrown
                });
              }
            );

          },
          responseToString: function(params, retval) {
            var res = "";
            for (var i = 0; i < retval.length; i++) {
              var item = retval[i];
              res += BDA_DASH.templates.printItemTemplate.format(item.id, buildSimpleTable(item, BDA_DASH.templates.tableTemplate, BDA_DASH.templates.rowTemplate));
            }
            return res;
          }

        },

        global: {
          commandPattern: '(domain|verbose|silent) value',
          help: 'verbose : make all commands verbose<br/>silent : all commands silent<br/>domain: change the domain to do the calls',
          paramDef: [{
            name: "action",
            type: "value"
          }, {
            name: "value",
            type: "value",
            required: false
          }],
          main: function(params, callback, errCallback) {
            var ret = "";
            switch (params.action) {
              case 'silent':
                BDA_DASH.settings.silent = (params.value == "true" ? true : false);
                ret = "setting global silent to {0}".format(BDA_DASH.settings.silent);
                break;
              case 'verbose':
                BDA_DASH.settings.verbose = (params.value == "true" ? true : false);
                ret = "setting global verbose to {0}".format(BDA_DASH.settings.verbose);
                break;
              case 'domain':
                var val = ((isNull(params.value) || params.value.length == 0) ? "" : params.value);
                if (val !="" && !val.startsWith("http")) {
                  throw {
                    name: "InvalidFormat",
                    message: "Domain must include protocol"
                  }
                }
                BDA_DASH.settings.domain = val;
                ret = "setting global domain to {0}".format(BDA_DASH.settings.domain);
                break;
              default:
                throw {
                  name: "InvalidParameter",
                  message: "Action {0} does not exists.<br/>Usage: global {1}".format(action, BDA_DASH.FCT.queries.commandPattern)
                }
            }
            callback(ret);
          }
        },

        queries: {

          commandPattern: '(add|list) (/some/Repo|@SHORT) [name {xmlText}]',
          help: 'list : list the existing queries - add : saves the xmlQuery between brackets',
          paramDef: [{
            name: "action",
            type: "value"
          }, {
            name: "repo",
            type: "component",
            required: true
          }, {
            name: "name",
            type: "value",
            required: false
          }, {
            name: "xmlText",
            type: "value",
            required: false
          }],
          main: function(params, callback, errCallback) {

            var action = params.action;

            switch (action) {
              case "list":

                var queries = BDA_STORAGE.getStoredRQLQueries();
                var purgedRqlQueries = [];
                if (!isNull(params.repo)) {

                  for (var i = 0; i != queries.length; i++) {
                    var query = queries[i];
                    if (!query.hasOwnProperty("repo") || query.repo == getComponentNameFromPath(params.repo)) {
                      purgedRqlQueries.push(query);
                    }
                  }

                } else {
                  purgedRqlQueries = queries;
                }

                callback(purgedRqlQueries);

                break;
              case "add":

                var name = $.trim(params.name);
                var xmlText = $.trim(params.xmlText);
                if (isNull(name) || name.length == 0) {
                  throw {
                    name: "MissingParameters",
                    message: "Missing query name"
                  }
                }
                if (isNull(xmlText) || xmlText.length == 0) {
                  throw {
                    name: "MissingParameters",
                    message: "Missing xmlText"
                  }
                }

                var savedQuery = BDA_STORAGE.getQueryByName(params.repo, name);
                if (!isNull(savedQuery)) {
                  throw {
                    name: "ExistingValue",
                    message: "A query already exists with name {0} in {1}.".format(name, params.repo)
                  }
                }
                BDA_STORAGE.storeRQLQuery(name, xmlText, params.repo);
                var res = {
                  name: name,
                  xmlText: xmlText
                };

                callback(res);
                break;
              default:
                throw {
                  name: "InvalidParameter",
                  message: "Action {0} does not exists.<br/>Usage: queries {1}".format(action, BDA_DASH.FCT.queries.commandPattern)
                }
            }
          },

          responseToString: function(params, returnValue) {

            var textvalue = "";

            var action = params.action;

            switch (action) {
              case "list":
                var $values = $('<dl></dl>');
                for (var i = 0; i < returnValue.length; i++) {
                  var q = returnValue[i];
                  console.log(q.query);
                  $values.append($('<dt>{0}</dt>'.format(q.name + " : ")));
                  $values.append($('<dd></dd>')).append($('<pre></pre>').text(q.query));
                }
                var textvalue = $values.outerHTML();
                break;
              case "add":
                var util = $('<pre></pre>').text(returnValue.xmlText);
                textvalue = "Saved script {0} with content {1}".format(returnValue.name, util.outerHTML());
                break;
              default:
            }
            return textvalue;
          }
        },

        call: {

          commandPattern: '(/some/Component|@SHORT) methodName',
          help: 'call the method /someComponent.methodName and returns  the result',
          paramDef: [{
            name: "component",
            type: "component"
          }, {
            name: "method",
            type: "value"
          }],

          main: function(params, callback, errCallback) {
            if (BDA_DASH.settings.domain !== "") {
              BDA_DASH.log("Using other domain {0}".format(BDA_DASH.settings.domain), BDA_DASH.logLevels.info);
            }

            BDA_COMPONENT.call(
              BDA_DASH.settings.domain,
              params.component,
              params.method,
              function(value) {
                callback(value);
              },
              function(jqXHR, textStatus, errorThrown) {
                errCallback({
                  name: textStatus,
                  message: errorThrown
                });
              }
            );
          },

          responseToString: function(params, retval) {
            return JSON.stringify(retval);
          }
        },

        run: {

          commandPattern: 'scriptName',
          help: 'runs a saved script',
          paramDef: [{
            name: "scriptName",
            type: "value"
          }],

          main: function(params, callback, errCallback) {
            var name = params.scriptName;
            var savedScripts = BDA_STORAGE.getScripts();
            if (!isNull(savedScripts[name])) {
              BDA_DASH.stackInput(savedScripts[name].text);
              callback(name);
            } else {
              throw {
                name: "InvalidParameter",
                message: "No saved script by the name {0}".format(name)
              }
            }
          },

          responseToString: function(params, retval) {
            return "Running script {0}".format(retval);
          }
        },
        vars: {
          commandPattern: '',
          help: 'lists all the available variables',
          main: function(params, callback, errCallback) {


            callback(BDA_DASH.VARS);

          },
          responseToString: function(params, retval) {
            return '<pre>{0}</pre>'.format(vkbeautify.json(retval));
          }
        },

        comprefs: {

          commandPattern: '',
          help: 'lists all the available component references',
          main: function(params, callback, errCallback) {

            callback(BDA_DASH.COMP_REFS);

          },
          responseToString: function(params, retval) {
            return '<pre>{0}</pre>'.format(JSON.stringify(retval, null, 2));
          }
        },

        clear: {
          commandPattern: '',
          help: 'clears the screen - CTRL+L works also',
          main: function(params, callback, errCallback) {
            //BDA_DASH.$screen.find('.alert').each(function(){$(this).alert('close')});
            BDA_DASH.$screen.find('.alert').alert('close');
            BDA_DASH.updateProgress();
            BDA_DASH.handleNextStackElem();
          }
        },

        history: {
          commandPattern: '[clear]',
          paramDef: [{
            name: "action",
            type: "value",
            required: false
          }],

          main: function(params, callback, errCallback) {

            var action = params.action;
            if (!isNull(action)) {

              if ('clear' == action) {
                BDA_DASH.clearHistory();
              } else {
                throw {
                  name: "Invalid Param",
                  message: "Invalid action {0}".format(action)
                }
              }

            }
            callback(BDA_DASH.HIST);
          },
          responseToString: function(params, retval) {
            var $value = $('<ol></ol>')
            for (var i = 0; i < retval.length; i++) {
              var h = retval[i];
              $value.append($('<li></li>').text(h));
            }
            return $value.outerHTML();
          }
        },

        help: {
          commandPattern: '',
          help: 'prints this help',
          main: function(params, callback, errCallback) {

            var values = [];
            var msg, cmdPattern;
            values.push('<h5>Available Functions:</h5>')
            values.push('<ul>');
            for (var funcName in BDA_DASH.FCT) {
              msg = BDA_DASH.FCT[funcName].help;
              if (isNull(msg)) {
                msg = "";
              }
              cmdPattern = BDA_DASH.FCT[funcName].commandPattern;
              if (isNull(cmdPattern)) {
                cmdPattern = "";
              }
              values.push('<li><strong>{0} {1}</strong> - {2}</li>'.format(funcName, cmdPattern, msg));
            }
            values.push('</ul>');
            values.push(BDA_DASH.templates.helpMain);
            msg = values.join('');
            callback(msg);
          },
          responseToString: function(params, retval) {
            return retval;
          }
        },

        fav: {
          help: 'saves a component as a favorite',
          paramDef: [{
            name: "component",
            type: "component"
          }],

          main: function(params, callback, errCallback) {

            var path = params.component;
            //add /d/a/nucleus
            path = extendComponentPath(path);
            //check if fav exists
            if ($.fn.bdaToolbar.isComponentAlreadyStored(path)) {
              throw {
                name: "ExistingValue",
                message: "Favorite {0} already exists.".format(path),
                level: "warning"
              }
            } else {
              $.fn.bdaToolbar.saveFavorite(path, [], [], []);
              BDA_DASH.initCompRefs();
              callback(path);
            }
          },

          responseToString: function(params, retval) {
            return "Favorite {0} created".format(retval);
          }
        }
      },
      build: function() {
        console.time("dashBuild");
        logTrace('actually initialize dash');

        BDA_DASH.logLevel = BDA_DASH.logLevels.info;

        BDA_DASH.initialized = true;

        logTrace('init modal start');
        var consoleHtml;

        if (BDA_DASH.devMode) {
          $.ajax({
            url: "http://localhost/bda/html/dash.html",
            // only for dev!!
            async: false,
            success: function(data) {
              consoleHtml = data;
            }
          });
        } else {
          consoleHtml = BDA_DASH.templates.consoleModal;
        }
        consoleHtml = consoleHtml.format(BDA_DASH.version);

        $(consoleHtml).insertAfter(BDA.logoSelector);
        if (BDA_DASH.devMode) {
          $('#dashModal .modal-title').html('DEVMODE');
        }

        logTrace('init modal end');

        logTrace('default tab');
        var defaultTab = BDA_STORAGE.getConfigurationValue('dashDefaultTab');
        if (!isNull(defaultTab)) {
          $('#' + defaultTab).tab('show');
        }

        logTrace('bind dom elements to vars');
        BDA_DASH.$input = $('#dashInput');
        BDA_DASH.$screen = $('#dashScreen');
        BDA_DASH.$modal = $('#dashModal');
        BDA_DASH.$modalContent = $('#dashModal .modal-content');
        BDA_DASH.$footer = $('#dashFooter');
        BDA_DASH.$header = $('#dashModal .modal-header');
        BDA_DASH.$body = $('#dashModal .modal-body');
        BDA_DASH.$innerBody = $('#dashInnerBody');
        BDA_DASH.$control = $('#dashControl');


        logTrace('bind open modal focus');
        //when modal open, focus current tab main input
        BDA_DASH.$modal.on('shown.bs.modal', function() {
          //      $('.modal-backdrop').wrap('<div class="twbs"></div>');
          BDA_DASH.calcDesiredWindowHeight();
          BDA_DASH.updateScreenHeight();
          $('.tab-pane.active .main-input').focus();
        })

        //when tab change, focus the main input
        //change the screen size to keep the modal same size
        logTrace('bind tab change events');
        //init size
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {

          var $target = $(e.target);
          var fsMode = $target.attr('data-fs-mode') == "true";

          BDA_DASH.toggleFullScreen(fsMode);

          // BDA_DASH.updateScreenHeight(); //done bt toggleFS
          //save latest tab
          var tId = $target.attr('id');
          BDA_STORAGE.storeConfiguration('dashDefaultTab', tId);

          $('.tab-pane.active .main-input').focus();
        });
        //resize dash on window resize
        $(window).resize(function() {
          if (BDA_DASH.$modalContent.is(":visible")) {
            BDA_DASH.calcDesiredWindowHeight();
            BDA_DASH.updateScreenHeight();
          }
        });

        BDA_DASH.initTypeahead();

        BDA_DASH.loadHistory();

        //bind console input
        logTrace('bind enter');
        BDA_DASH.$input.keydown(function(e) {
          //ENTER
          if (e.which == 13 && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            BDA_DASH.histIdxOffset = 0;
            //close suggestions
            BDA_DASH.$input.typeahead('close');
            BDA_DASH.handleInput();
            return false;
          }
          //ctrl+C
          if (e.which == 67 && !e.altKey && !e.shiftKey && e.ctrlKey) {
            var input = BDA_DASH.$input[0];
            var selected = false;
            if (typeof input.selectionStart == "number") {
              //if selection length is not null
              selected = input.selectionStart < input.selectionEnd;
            }
            //only clear if nothing is selected
            if (!selected) {
              e.preventDefault();
              BDA_DASH.$input.typeahead('val', '');
              BDA_DASH.$input.typeahead('close');
              return false;
            }
          }
          //ctrl+K or ctrl+L
          if ((e.which == 75 || e.which == 76) && !e.altKey && !e.shiftKey && e.ctrlKey) {
            e.preventDefault();
            BDA_DASH.$screen.find('.alert').alert('close');
            return false;
          }
        });

        $('#dashClearScreen').on('click', function() {
          BDA_DASH.$screen.find('.alert').alert('close');
        });

        $('#dashFullScreen').on('click', function() {
          BDA_DASH.toggleFullScreen();
        });

        /*     BDA_DASH.$input.keydown(function(e) {
               if (e.which == 38 && e.shiftKey) {
                 BDA_DASH.moveInHistory(true);
               }
               if (e.which == 40 && e.shiftKey) {
                 BDA_DASH.moveInHistory(false);
               }
             });*/
        logTrace('bind clear');
        $('#dashCleanInput').on('click', function(e) {
          e.preventDefault();
          BDA_DASH.$input.typeahead('val', '');
          BDA_DASH.$input.typeahead('close');
          return false;
        });


        BDA_DASH.initCompRefs();

        BDA_DASH.initEditor();

        BDA_DASH.$modal.on("click", ".dash_redo", function(event) {
          BDA_DASH.redo($(this).parent().parent().attr('data-command'));
        });

        BDA_DASH.$modal.on("click", ".dash_clipboard", function(event) {
          logTrace('copyToClipboard');
          var txtcmd = $(this).parent().parent().attr('data-command');
          logTrace(txtcmd);
          if (!isNull(txtcmd) && txtcmd.length > 0) {
            copyToClipboard(txtcmd);
          }
        });

        BDA_DASH.handleInput('help -k'); //skip history..
        console.timeEnd("dashBuild");
      },

      submitSaveScriptForm: function() {
        var scriptName = $('#dashSaveScriptName').val();
        var scriptText = $('#dashEditor').val();
        var override = true;
        BDA_DASH.saveScript(scriptName, scriptText, override);
        BDA_DASH.reloadScripts(scriptName);
      },

      //reset save mode
      resetSaveState: function() {
        $('#dashScreen .dash_save').each(function() {
          var $this = $(this);
          $this.removeClass('btn-success');
          var $checkbox = $this.children('input:checkbox:first');
          $checkbox.prop('checked', false);
        });
      },

      getScriptTextFromSaveScreen: function() {

        var lines = [];
        $('#dashScreen .dash_save .innerCheckbox:checked').each(function() {
          var cmd = $(this).parent().parent().attr('data-command').trim();
          if (!isNull(cmd) && cmd.length > 0) {
            lines.push(cmd);
          }

        })
        return lines.join('\n');
      },

      toggleSaveLine: function() {
        try {

          var $this = $(this);
          var $checkbox = $this.children('input:checkbox:first');
          $this.toggleClass('btn-success');
          $checkbox.prop('checked', !$checkbox.prop('checked'));
          logTrace('save value: ' + $checkbox.prop('checked'));
        } catch (e) {
          log(e);
        }
      },

      //we always want the dash window to be some size of the tota
      calcDesiredWindowHeight: function() {
        var windowH = window.innerHeight;
        logTrace(' windowH ' + windowH);
        var val = Math.floor(windowH * BDA_DASH.modalHeightRatio);
        BDA_DASH.modalHeight = val;
        logTrace('new modalHeight ' + val);
      },

      updateScreenHeight: function() {
        var fs = BDA_DASH.$modal.attr('data-fullscreen');
        //adapt modal size
        if (fs == "true") {
          if (BDA_DASH.$editor.is(":visible")) {
            logTrace("adjust editor");
            //set size to 0 so that it does not impact form size
            BDA_DASH.$screen.setHeightAndMax(0);
            //push editor to max size
            BDA_DASH.$editor.adjustToFit(BDA_DASH.$modalContent, BDA_DASH.modalHeight);
            //set screen to the form size
            BDA_DASH.$screen.setHeightAndMax($('#dashEditorForm').fullHeight());

          } else {
            logTrace("adjust screen");
            BDA_DASH.$screen.adjustToFit(BDA_DASH.$modalContent, BDA_DASH.modalHeight);
          }

        } else {
          //revert editor then resize body
          BDA_DASH.$editor.removeAttr('style');
          BDA_DASH.$screen.adjustToFit(BDA_DASH.$modalContent, BDA_DASH.modalHeight);
        }
      },

      saveScript: function(scriptName, scriptText, override) {

        try {
          //validation
          if (isNull(scriptName) || scriptName.length == 0) {
            throw {
              name: "Missing Script Name",
              message: "Cannot save script with empty name"
            }
          }

          if (isNull(scriptText) || scriptText.length == 0) {
            throw {
              name: "Empty Script",
              message: "Cannot save empty script"
            }
          }
          var script = null;
          var savedScripts = BDA_STORAGE.getScripts();
          if (!override) {
            script = savedScripts[scriptName];
            if (!isNull(script)) {
              throw {
                name: "Existing Script",
                message: "A script already exists with the same name {0}".format(scriptName)
              }
            }
          }

          script = {
            name: scriptName,
            text: scriptText
          }

          savedScripts[scriptName] = script;

          BDA_STORAGE.saveScripts(savedScripts);

          BDA_DASH.writeSysResponse("Saved script {0}</br><pre>{1}</pre>".format(scriptName, scriptText), "success");

        } catch (e) {
          BDA_DASH.handleSysError("", e);
        }

      },

      deleteScript: function(name) {
        var r = confirm('Confirm deletion of script "{0}"'.format(name));
        logTrace('deleting script {0}'.format(name));
        if (r == true) {
          var savedScripts = BDA_STORAGE.getScripts();
          delete savedScripts[name];
          BDA_STORAGE.saveScripts(savedScripts);
          BDA_DASH.reloadScripts();
        }
      },

      loadScript: function(name) {
        var savedScripts = BDA_STORAGE.getScripts();
        $('#dashEditor').val(savedScripts[name].text);
        $('#dashSaveScriptName').val(name);
      },

      reloadScripts: function(defaultName) {
        $('#dashEditorScriptList').html('');
        var $list = $('#dashEditorScriptList');

        var savedScripts = BDA_STORAGE.getScripts();
        logTrace('savedScripts ' + JSON.stringify(savedScripts));
        var lines = [];
        //default
        var line = BDA_DASH.templates.editorScriptLine.format("", "Choose a script");
        lines.push(line);
        for (var name in savedScripts) {
          logTrace('name ' + name);
          line = BDA_DASH.templates.editorScriptLine.format(name, name);
          lines.push(line);
        }

        $(lines.join('')).appendTo($list);
        if (!isNull(defaultName)) {
          $list.val(defaultName);
        }

      },

      initEditor: function() {
        console.log('initEditor');

        BDA_DASH.$editor = $('#dashEditor');

        //bind toggle
        $('#dashClearEditor').on('click', BDA_DASH.clearEditor);

        $('#dashSaveEditor').on('click', function() {
          BDA_DASH.submitSaveScriptForm()
        });

        BDA_DASH.reloadScripts();

        $('#dashDeleteScript').on('click', function() {
          var name = $('#dashEditorScriptList').val();
          BDA_DASH.deleteScript(name);
        });

        $('#dashEditorScriptList').on('change', function() {
          var name = $(this).val();
          if (!isNull(name) && name.length > 0) {
            BDA_DASH.loadScript(name);

          }
        });

        /* $('#dashLoadScript').on('click', function() {
           var name = $('#dashEditorScriptList').val();
           BDA_DASH.loadScript(name);
         });*/

        BDA_DASH.$editor.keydown(function(e) {
          if (e.which == 13 && e.altKey && !e.shiftKey && !e.ctrlKey) {
            e.preventDefault();

            var inputText = BDA_DASH.$editor.val();

            var input = BDA_DASH.$editor[0];
            if (!isNull(inputText) && inputText.length > 0 && typeof input.selectionStart == "number") {
              var start = input.selectionStart
              var end = input.selectionEnd;
              console.log(start);
              console.log(end);
              //if selection length is not null
              if (end > start) {
                inputText = inputText.substring(start, end);
              }
              console.log(inputText);
            }

            BDA_DASH.handleInput(inputText);
            return false;
          }

          //ctrl+C
          if (e.which == 67 && !e.altKey && !e.shiftKey && e.ctrlKey) {
            var input = BDA_DASH.$editor[0];
            var selected = false;
            if (typeof input.selectionStart == "number") {
              //if selection length is not null
              selected = input.selectionStart < input.selectionEnd;
            }
            //only clear if nothing is selected
            if (!selected) {
              e.preventDefault();
              BDA_DASH.$input.typeahead('val', '');
              BDA_DASH.$input.typeahead('close');
              return false;
            }
          }
          //ctrl+K or ctrl+L
          if ((e.which == 75 || e.which == 76) && !e.altKey && !e.shiftKey && e.ctrlKey) {
            e.preventDefault();
            BDA_DASH.$screen.find('.alert').alert('close');
            return false;
          }
        });

        $('#dashRunEditor').on('click', function() {
          var input = BDA_DASH.$editor.val();
          BDA_DASH.handleInput(input);
        });

      },

      clearEditor: function() {
        $('#dashSaveScriptName').val('');
        BDA_DASH.$editor.val('');
      },

      initTypeahead: function() {

        try {
          logTrace('init typeahead');
          //init type ahead with all the existing functions
          BDA_DASH.typeahead_base = [];
          for (var funcName in BDA_DASH.FCT) {
            var fct = BDA_DASH.FCT[funcName];
            //    var e = funcName;
            var e = {
              value: funcName,
              pattern: fct.commandPattern
            };
            BDA_DASH.typeahead_base.push(e);
          }

          logTrace(JSON.stringify(BDA_DASH.typeahead_base));

          BDA_DASH.suggestionEngine = new Bloodhound({
            initialize: true,
            local: BDA_DASH.typeahead_base,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            datumTokenizer: function(datum) {
              return Bloodhound.tokenizers.whitespace(datum.value);
            },
            identify: function(obj) {
              return obj.value;
            }

          });

          BDA_DASH.$input.typeahead({
            minLength: 1,
            highlight: true,

          }, {
            name: 'dash',
            hint: true,
            //highlight: true,
            minLength: 1,
            source: BDA_DASH.suggestionEngine,
            displayKey: 'value',
            templates: {
              suggestion: function(data) {
                var pattern = data.pattern;
                if (isNull(pattern)) {
                  pattern = "";
                }
                return '<div><strong>{0}</strong>{1}</div>'.format(data.value, pattern);
              }
            }
          });

          //ability to delete entries from typeahead
          BDA_DASH.$input.keydown(function(e) {

            //up
            if (e.which == 38) {
              BDA_DASH.moveInHistory(true);
            }
            //down
            if (e.which == 40) {
              BDA_DASH.moveInHistory(false);
            }
            //suppr /del
            //  console.log(e.which);
            /* if(e.which == 46){
               var text = $('.tt-menu .tt-cursor').text();
               console.log(text);
               var idx = BDA_DASH.HIST.indexOf(text);
               while(idx >-1){
                 BDA_DASH.HIST.splice(idx,1);
                 idx = BDA_DASH.HIST.indexOf(text);
               }
               BDA_DASH.clearHistory();
             }*/
          });

        } catch (e) {
          console.error(e);
        }

      },

      openDash: function() {
        try {

          if (!BDA_DASH.initialized) {
            BDA_DASH.build();
          }
        } catch (e) {
          console.error(e);
        }

        var rdm = Math.floor(Math.random() * BDA_DASH.templates.tips.length);
        var tip = BDA_DASH.templates.tips[rdm];
        $('#dashTips').html(tip);
        BDA_DASH.$modal.modal('show');
      },

      handleInput: function(input) {
        try {

          $('#dash_dollar').hide();
          $('#dash_spinner').show();
          BDA_DASH.STACK = []; //clear
          BDA_DASH.resetProgress(0);

          BDA_DASH.stackInput(input);

          try {
            //start handling the queue
            BDA_DASH.handleNextStackElem();
          } catch (e) {
            BDA_DASH.handleError(input, e);
          }

        } catch (e) {
          logTrace(e);
        }
      },

      stackInput: function(input) {
        if (isNull(input)) {
          input = BDA_DASH.$input.val();
        }
        var commands;
        if (!isNull(input)) {
          input = $.trim(input);
          commands = DASH_LINES_SPLITTER.parse(input);
        } else {
          commands = [];
        }
        logTrace('input: {0}'.format(input));

        try {
          //loop in reverse, so that we can use a stack
          for (var i = commands.length - 1; i >= 0; i--) {
            var stringCmd = commands[i];
            stringCmd = $.trim(stringCmd);
            if (!isNull(stringCmd) && stringCmd.length > 0) {
              var command = BDA_DASH.parse(stringCmd);
              BDA_DASH.STACK.push([stringCmd, command]);
              BDA_DASH.pushProgress(1);
            }
          }
        } catch (e) {
          BDA_DASH.handleError(input, e);
        }
      },

      handleNextStackElem: function() {
        var cmd = BDA_DASH.STACK.pop();
        if (!isNull(cmd)) {
          try {
            BDA_DASH.executeCommand(cmd[0], cmd[1]);

          } catch (e) {
            BDA_DASH.handleError(cmd[0], e);
          }
        } else {
          $('#dash_dollar').show();
          $('#dash_spinner').hide();
          BDA_DASH.$input.typeahead('val', '');
          setTimeout(function() {
              $('#dashProgressBar').parent().fadeOut();
            }, 2000)
            //          BDA_DASH.$input.val('');
        }
      },

      executeCommand: function(stringCmd, command) {
        logTrace('executeCommand:');
        logTrace(JSON.stringify(command));

        //get the flags even before we parsed the params.
        //used to skip history for the help command used on modal build
        if (command.params.length == 0 || command.params[0].type != 'flags' || command.params[0].values.indexOf(BDA_DASH.flags.SKIP_HISTORY) == -1) {
          BDA_DASH.saveHistory(stringCmd, true);
        }

        var fct = BDA_DASH.FCT[command.funct]
        if (!isNull(fct) && !isNull(fct.main)) {
          // 1 extract params
          var parsedParams = BDA_DASH.parseParams(fct.paramDef, command.params);
          // 2 exec function
          fct.main(
            parsedParams,
            function(result) {
              var textResult = "";
              if (!BDA_DASH.settings.silent && !BDA_DASH.hasFlag(parsedParams, BDA_DASH.flags.SILENT)) {
                if (isNull(fct.responseToString)) {
                  textResult = JSON.stringify(result);
                } else {
                  textResult = fct.responseToString(parsedParams, result);
                }
              }
              BDA_DASH.handleOutput(stringCmd, parsedParams, result, textResult, "success");
            },
            function(err) {
              BDA_DASH.handleError(stringCmd, err);
            });



        } else {
          throw {
            name: "Unknown function",
            message: "The {0} function does not exist.".format(fct)
          }
        }

      },

      handleError: function(val, err) {
        logTrace(err);
        var errMsg = BDA_DASH.templates.errMsg.format(err.name, err.message);
        var level = err.level;
        if (isNull(level)) {
          level = "error";
        }
        BDA_DASH.handleOutput(val, null, null, errMsg, level);
      },

      handleSysError: function(val, err) {
        logTrace(err);
        var errMsg = BDA_DASH.templates.errMsg.format(err.name, err.message);
        BDA_DASH.writeSysResponse(errMsg, "error");
      },

      //end method, should be always called at the end of a shell function
      handleOutput: function(cmd, params, result, textResult, level) {

        //save the result
        logTrace('handleOutput ' + textResult);
        logTrace(params);
        if (!isNull(result) && !isNull(params) && !isNull(params.output)) {
          BDA_DASH.saveOutput(result, params.output);
        }

        //print the logs
        var logs = [];
        var globalVerbose = BDA_DASH.settings.verbose || BDA_DASH.hasFlag(params, BDA_DASH.flags.VERBOSE);
        for (var i = 0; i < BDA_DASH.LOG.length; i++) {
          var l = BDA_DASH.LOG[i];
          if (globalVerbose || l.level.value >= BDA_DASH.logLevel.value) {
            logs.push('<p class="text-{0}">{1}</p>'.format(BDA_DASH.styles[l.level.name], l.message));
          }
        }

        var logMsg = logs.join('');
        BDA_DASH.LOG = []; //reset

        var msgClass = BDA_DASH.styles[level];
        var $entry = $(BDA_DASH.templates.screenLine.format(textResult, msgClass, logMsg));
        $entry.find('.cmd').text(cmd);
        $entry.attr('data-command', cmd);
        $entry.appendTo(BDA_DASH.$screen);

        BDA_DASH.$screen.scrollTop(BDA_DASH.$screen[0].scrollHeight);
        BDA_DASH.updateProgress();
        BDA_DASH.handleNextStackElem();
        return $entry;
      },

      saveOutput: function(result, outputDef) {

        if (isNull(result)) {
          logTrace("result is null, not saving anything");
          return;
        }

        logTrace('saveOutput');
        logTrace(outputDef);
        logTrace(result);

        //handle everything like an arrray
        var resArray = [].concat(result);

        logTrace(resArray);
        var idx = outputDef.index;
        if (isNull(idx)) {
          idx = 0;
        }
        var res = resArray[idx];
        logTrace(res);

        if (isNull(res)) {
          logTrace("result is null, not saving anything");
          return;
        }

        var out;
        if (isNull(outputDef.format)) {
          out = res;
        } else {

          switch (outputDef.format.type) {
            case 'value':
              out = subProp(res, outputDef.format.value);
              break;
            case 'objectDef':
              out = {};
              for (var i = 0; i < outputDef.format.value.length; i++) {
                var def = outputDef.format.value[i];
                logTrace(def);
                //def.path is of form a.b.c
                var val = subProp(res, def.path);
                logTrace(val);
                out[def.name] = val;
              }
              break;
            default:
              throw {
                name: 'InvalidType',
                message: 'Invalid output format'
              }
          }


        }
        logTrace('output:');
        logTrace(out);
        BDA_DASH.VARS[outputDef.name] = out;
      },

      //
      writeSysResponse: function(msg, level) {
        var msgClass = BDA_DASH.styles[level];
        var $entry = $(BDA_DASH.templates.systemResponse.format(msg, msgClass));
        $entry.appendTo(BDA_DASH.$screen);
        BDA_DASH.$screen.scrollTop(BDA_DASH.$screen[0].scrollHeight);
        return $entry;
      },

      moveInHistory: function(up) {
        console.log('moveInHistory ' + up);
        var offset = BDA_DASH.histIdxOffset;
        if (up) {
          offset++;
        } else {
          offset--;
        }
        var idx = BDA_DASH.HIST.length - offset;
        console.log('idx =' + idx);
        if (idx >= 0 && idx < BDA_DASH.HIST.length) {
          var val = BDA_DASH.HIST[idx];
          BDA_DASH.$input.val(val);
          BDA_DASH.$input.typeahead('val', val);
          BDA_DASH.$input.typeahead('close');
        }
        var newoffset = BDA_DASH.HIST.length - idx;
        //clamp the idx after
        if (newoffset < 0) {
          newoffset = 0;
        }
        if (newoffset > BDA_DASH.HIST.length) {
          newoffset = BDA_DASH.HIST.length;
        }
        BDA_DASH.histIdxOffset = newoffset;
        console.log('BDA_DASH.histIdxOffset = ' + BDA_DASH.histIdxOffset);
      },

      clearHistory: function(newValue) {
        BDA_DASH.HIST = [];
        BDA_DASH.suggestionEngine.clear();
        BDA_DASH.suggestionEngine.add(BDA_DASH.typeahead_base);
        BDA_STORAGE.storeConfiguration('dashHistory', BDA_DASH.HIST);
      },


      saveHistory: function(val, persist) {
        BDA_DASH.HIST.push(val);
        if (!isNull(BDA_DASH.suggestionEngine)) {
          BDA_DASH.suggestionEngine.add([{
            value: val,
            pattern: ''
          }]);
        }
        if (persist) {
          //persist history
          //on last X
          var tosave;
          var maxSize = BDA_DASH.hist_persist_size;
          if (BDA_DASH.HIST.length <= maxSize) {
            tosave = BDA_DASH.HIST;
          } else {
            tosave = BDA_DASH.HIST.slice(BDA_DASH.HIST.length - maxSize, BDA_DASH.HIST.length);
          }
          BDA_STORAGE.storeConfiguration('dashHistory', tosave);
        }
      },

      suggestionEngineWithDefault: function(q, sync) {
        if (q === '') {
          var clone = BDA_DASH.HIST.slice(0);
          clone.reverse();
          sync(clone);
        } else {
          BDA_DASH.suggestionEngine.search(q, sync);
        }
      },

      loadHistory: function() {
        logTrace('load history');
        var hist = BDA_STORAGE.getConfigurationValue('dashHistory');
        if (!isNull(hist)) {
          for (var i = 0; i < hist.length; i++) {
            var h = hist[i];
            BDA_DASH.saveHistory(h, false);
          }
        }
      },

      goToComponent: function(component) {
        var url = "/dyn/admin/nucleus" + component;
        window.location = url;
      },

      redo: function(input) {
        logTrace("redo : " + input);
        BDA_DASH.handleInput(input);
      },

      getVarValue: function(param) {
        console.log("getVarValue");
        console.log(param);
        var val = BDA_DASH.VARS[param.name];
        if (val == undefined || val == null) {
          val = "";
        }
        if (!isNull(param.path) && param.path !== "") {
          val = subProp(val, param.path);
        }
        return val;
      },

      parseParams: function(pExpected, params) {
        logTrace("parseParams");
        var res = {};
        if (!isNull(pExpected)) {
          var expected = BDA_DASH.flagsParamDef.concat(pExpected).concat(BDA_DASH.defaultParams);

          logTrace(expected);

          var j = 0;
          for (var i = 0; i < expected.length; i++) {
            var exp = $.extend({
              required: true
            }, expected[i]);;
            var inParam = params[j];

            logTrace('parseParam:');
            logTrace('exp = ' + JSON.stringify(exp));
            logTrace('inParam = ' + JSON.stringify(inParam));

            if (isNull(inParam)) {

              if (exp.required) {
                throw {
                  name: "Missing argument",
                  message: "Missing {0} at #{1}".format(exp.name, i)
                }
              } //else j stays the same

            } else {

              try {
                res[exp.name] = BDA_DASH.getParamValue(exp, inParam);
                j++; //consider next param
              } catch (e) {
                //if error, j is not increased
                if (exp.required) {
                  //only raise error if param is required else inspect the next expected value
                  throw e;
                }
              }

            }
          }
        }
        return res;
      },

      //match expected type & actual
      getParamValue: function(exp, param) {

        var res;

        switch (exp.type) {
          case 'component':
            res = BDA_DASH.getComponent(param);
            break;
          case 'componentProperty':
            res = BDA_DASH.getComponentProperty(param);
            break;
          case 'value':
            res = BDA_DASH.getValue(param);
            break;
          case 'array':
            res = BDA_DASH.getArrayValue(param.value);
            break;
          case 'output':
            res = param;
            break;
          case 'flags':
            res = BDA_DASH.getFlags(param);
            break;
          default:
            throw {
              name: "Parsing Exception",
              message: "invalid parameter type"
            }
        }
        logTrace("getParamValue : " + JSON.stringify(res));
        return res;
      },

      getValue: function(param) {
        logTrace('getValue : param : ' + JSON.stringify(param));
        var res = "";
        switch (param.type) {
          case "value":
            res = param.value;
            break;
          case "varRef":
            res = BDA_DASH.getVarValue(param);
            if (isNull(res)) {
              throw {
                name: "Invalid Name",
                message: "No such variable {0}".format(param.name)
              }
            }
            break;
          case "componentRef":
          case "componentPath":
          case "this":
            res = BDA_DASH.getComponent(param);
            break;
          case "multiline":
            res = param.value;
            break;
          default:
            throw {
              name: "Parsing Exception",
              message: "invalid value type {0}".format(param.type)
            }
        }
        return res;
      },

      getArrayValue: function(paramArray) {
        logTrace('getArrayValue');
        logTrace(paramArray);
        var res = [];
        for (var i = 0; i < paramArray.length; i++) {
          var param = paramArray[i];
          var value = BDA_DASH.getValue(param);
          res.push(value);
        }
        logTrace(res);
        return res;
      },

      getComponentProperty: function(param) {

        if (param.type !== 'componentProperty') {
          throw {
            name: "Parsing Exception",
            message: "invalid component type"
          }
        }

        return {
          property: BDA_DASH.getValue(param.property),
          path: BDA_DASH.getComponent(param.component)
        }

      },

      getComponent: function(componentParam) {
        console.log('componentParam : ' + JSON.stringify(componentParam));
        var path = "";
        switch (componentParam.type) {
          case "this":
            path = getCurrentComponentPath();
            BDA_DASH.log('input <em>{0}</em> translated to <em>{1}</em>'.format('this', path), BDA_DASH.logLevels.debug);
            break;
          case "varRef":
            path = BDA_DASH.getVarValue(componentParam);
            break;
          case "componentPath":
            path = componentParam.path;
            break;
          case "componentRef":
            var shortname = componentParam.name;
            var ref = BDA_DASH.COMP_REFS[shortname];
            var idx = componentParam.index;
            if (isNull(ref)) {
              throw {
                name: "Invalid Name",
                message: "No such component {0}".format(shortname)
              }
            }
            if (ref.length == 1) {
              path = ref[0];
            } else if (!isNull(idx)) {
              if (idx >= ref.length) {
                throw {
                  name: "Index out of bound",
                  message: "Index {0}#{1} is out of bound : <br/> <pre>{2}</pre>".format(shortname, idx, JSON.stringify(ref, null, 2))
                }
              }
              path = ref[idx];
            } else {
              throw {
                name: "Ambiguous Reference",
                message: "Reference {0} is ambiguous. Specify index.<br/> <pre>{1}</pre>".format(componentParam.name, JSON.stringify(ref, null, 2))
              }
            }
            BDA_DASH.log('input <em>{0}#{1}</em> translated to <em>{2}</em>'.format(shortname, idx, path),BDA_DASH.logLevels.debug);
            break;
          default:
            throw {
              name: "Parsing Exception",
              message: "invalid component parameter"
            }
        }
        return path;
      },

      getFlags: function(param) {
        if (param.type != "flags") {
          throw {
            name: "Parsing Exception",
            message: "invalid value type {0}".format(param.type)
          }
        }
        return param;
      },

      parse: function(val) {
        return BDA_DASH_PARSER.parse(val);
      },

      initCompRefs: function() {
        BDA_DASH.COMP_REFS = [];
        var comps = BDA_STORAGE.getStoredComponents();
        var fav, compRefList, key;
        for (var i = 0; i < comps.length; i++) {
          fav = comps[i];
          key = getComponentShortName(fav.componentName);
          compRefList = BDA_DASH.COMP_REFS[key];
          if (isNull(compRefList)) {
            compRefList = [];
          }
          //only keep the nucleus path for consistency
          compRefList.push(fav.componentPath.replace(/\/dyn\/admin\/nucleus/g, '').replace(/\/$/g, ''));
          BDA_DASH.COMP_REFS[key] = compRefList;
        }
      },

      createMenuElem: function() {
        var $elem = $(BDA_DASH.templates.menuElem);
        $elem
          .on('click', BDA_DASH.openDash);
        return $elem;
      },

      formatRql: function(rql, args) {

        return rql.replace(/\$(\d+)/g,
          function(match, number) {
            return typeof args[number] !== undefined ? args[number] : match;
          });
      },

      hasFlag: function(params, flag) {
        return (!isNull(params) && !isNull(params.flags) && params.flags.values.indexOf(flag) > -1);

      },

      toggleFullScreen: function(on) {
        if (isNull(on)) {
          var fs = BDA_DASH.$modal.attr('data-fullscreen');
          on = (fs == "true");
        }
        if (on) {
          BDA_DASH.$modal.attr('data-fullscreen', true).addClass('fullscreen');
          $('.dashcol').removeClass('col-lg-12').addClass('col-lg-6');
        } else {
          BDA_DASH.$modal.attr('data-fullscreen', false).removeClass('fullscreen');
          $('.dashcol').removeClass('col-lg-6').addClass('col-lg-12');
        }
        //update modal size
        BDA_DASH.updateScreenHeight();
      },

      resetProgress: function(total) {
        BDA_DASH.progress.current = 0;
        BDA_DASH.progress.total = total;
        var $bar = $('#dashProgressBar');
        $bar.css('width', '0');
        $bar.text('0/{0}'.format(total));
        if (total > 1) {
          $bar.parent().fadeIn();
        }
      },

      pushProgress: function(size) {
        if (isNull(size)) {
          size = 1;
        }
        var $bar = $('#dashProgressBar');
        BDA_DASH.progress.total += size;
        if (BDA_DASH.progress.total > 1) {
          $bar.parent().fadeIn();
        }
      },

      updateProgress: function() {
        BDA_DASH.progress.current++;
        var $bar = $('#dashProgressBar');
        var ratio = 0;
        if (BDA_DASH.progress.total > 0) {
          ratio = BDA_DASH.progress.current / BDA_DASH.progress.total * 100;
        };
        $bar.css('width', ratio + '%');
        $bar.text('{0}/{1}'.format(BDA_DASH.progress.current, BDA_DASH.progress.total));
        //move to bottom
        var $progress = $bar.parent().detach().appendTo(BDA_DASH.$screen);
      },

      log: function(msg, level) {
        if (isNull(level)) {
          level = BDA_DASH.logLevels.info;
        }
        BDA_DASH.LOG.push({
          message: msg,
          level: level
        });
      },

    };

    logTrace('bda.dash.js start');
    var settings;

    $(document).keydown(function(e) {
      if (e.ctrlKey && e.altKey && e.which == 84) {
        e.preventDefault();
        BDA_DASH.openDash();
      }
    });

    $.fn.initDASH = function(pBDA, options) {
      logTrace('Init plugin {0}'.format('DASH'));
      BDA = pBDA;
      BDA_STORAGE = $.fn.bdaStorage.getBdaStorage();


      if ($().bdaAddMenuElem) {
        logTrace('before init menu elem');
        $().bdaAddMenuElem(BDA_DASH.createMenuElem());
      }

      return this;
    }

    $.fn.openDash = function() {
      BDA_DASH.openDash();
    }

    logTrace('bda.dash.js end');


  })(jQuery);
});
