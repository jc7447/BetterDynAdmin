// DASH DynAdmin SHell
"use strict";
jQuery(document).ready(function() {
  (function($) {

    var BDA;
    var BDA_STORAGE;
    var BDA_DASH = {

      devMode: false,
      debugMode: false,

      // dom elements
      $screen: null,
      $input: null,
      $modal: null,

      screenHeight : 300,
      //
      initialized: false,

      styles: {
        success: "alert-success",
        error: "alert-danger",
        warning: "alert-warning",
        hidden: "hidden"
      },
      keyword_this: "this",
      templates: {
        consoleModal: '<div class="twbs">' +
          '<div id="dashModal" class="modal fade" tabindex="-1" role="dialog">' +
          '<div id="dashModalDialog" class="modal-dialog modal-lg">' +
          '<div class="modal-content">' +
          '<div class="modal-header">' +
          '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
          '<h4 class="modal-title">DASH - DynAdmin SHell</h4>' +
          '</div>' +
          '<div id="dashScreen" class="modal-body">' +
          '</div>' +
          '<div id="dashFooter" class="modal-footer">' +
          '<div class="tab-content">' +
          '<div role="tabpanel" class="tab-pane fade in  active" id="dash-console-tab">' +
          '<form id="dashForm" class="">' +
          '<div class="form-group">' +
          '<div class="input-group">' +
          '<div class="input-group-addon"><span id="dash_dollar">$</span><i class="fa fa-spinner fa-spin" id="dash_spinner" style="display: none;"></i></div>' +
          '<input type="text" class="form-control dash-input main-input" id="dashInput" placeholder="" name="cmd" data-provide="typeahead" autocomplete="off"/>' +
          '</div>' +
          '</div>' +
          '</form>' +
          '<div>' +
          '&nbsp;' +
          '</div>' +
          '</div>' +
          '<div role="tabpanel" class="tab-pane fade" id="dash-editor-tab">' +
          '<form id="dashEditorForm" class="form-horizontal">' +
          '<div class="form-group">' +
          '<div class="col-sm-3">' +
          '<select id="dashEditorScriptList" class="form-control">' +
          '</select>' +
          '</div>' +
          '<div class="col-sm-2">' +
          '<div class="btn-group" role="group" >' +
          '<button type="button" id="dashLoadScript" class="btn btn-primary">' +
          '<i class="fa fa-folder-open" aria-hidden="true"/>&nbsp;' +
          '</i>' +
          '</button>' +
          '<button type="button" id="dashDeleteScript" class="btn btn-primary">' +
          '<i class="fa fa-trash-o" aria-hidden="true"/>&nbsp;' +
          '</i>' +
          '</button>' +
          '</div>' +
          '</div>' +
          '<div class="col-sm-3"></div>' +
          '<label for="dashSaveScriptName" class="col-sm-1 control-label">Name</label>' +
          '<div class="col-sm-3">' +
          '<input type="text" class="form-control dash-input main-input" id="dashSaveScriptName" placeholder="Name" name="save" autocomplete="off"></input>' +
          '</div>' +
          '</div>' +
          '<div class="form-group">' +
          '<div class="col-sm-12">' +
          '<textarea id="dashEditor" class="form-control dash-input main-input" rows="5" placeholder=""></textarea>' +
          '</div>' +
          '</div>' +
          '<div class="form-group">' +
          '<div class="col-sm-1">' +
          '<button type="button" id="dashClearEditor" class="btn btn-primary">' +
          '<i class="fa fa-ban" aria-hidden="true"/>&nbsp;' +
          '</i>' +
          '</button>' +
          '</div>' +
          '<div class="col-sm-9">' +
          '</div>' +
          '<div class="col-sm-2">' +
          '<div class="btn-group pull-right" role="group" >' +
          '<button type="button" id="dashRunEditor" class="btn btn-primary">' +
          '<i class="fa fa-play" aria-hidden="true"/>&nbsp;' +
          '</i>' +
          '</button>' +
          '<button type="button" id="dashSaveEditor" class="btn btn-primary">' +
          '<i class="fa fa-floppy-o" aria-hidden="true"/>&nbsp;' +
          '</i>' +
          '</button>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</form>' +
          '</div>' +
          '</div>' +
          '<ul class="nav nav-pills">' +
          '<li role="presentation" class="active"><a href="#dash-console-tab" aria-controls="console" role="tab" data-toggle="tab">Console</a></li>' +
          '<li role="presentation"><a id="dashEditorButton"  href="#dash-editor-tab" aria-controls="editor" role="tab" data-toggle="tab">Editor</a></li>' +
          '</ul>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>',
        screenLine: '<div class="dash_screen_line alert {3} alert-dismissible" role="alert" data-command="{0}">' +
          '<button type="button" class="close dash_close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
          '<button type="button" class="btn btn-default dash_save" aria-label="Save" aria-pressed="false" style="display:none;" >' +
          '<i class="fa fa-floppy-o" aria-hidden="true"></i>' +
          '<input type="checkbox" class="innerCheckbox hidden"/>' +
          '</button>' +
          '<button type="button" class="close dash_redo"  aria-label="Redo"><i class="fa fa-repeat" aria-hidden="true"></i></button>' +
          '<p class="dash_feeback_line">$&gt;&nbsp;{0}</p>' +
          '<p class="dash_debug_line">{1}</p>' +
          '<p class="dash_return_line">{2}</p>' +
          '</div>',
        systemResponse: '<div class="dash_screen_sys_res alert {1} alert-dismissible" role="alert" >' +
          '<button type="button" class="close dash_close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
          '<p class="dash_return_line">{0}</p>' +
          '</div>',
        not_implemented: 'This command is not implemented yet.',
        helpMain: '<div>References:<ul>' +
          '<li>Reference to variable : $varName</li>' +
          '<li>Reference to component : @FAV - where FAV is the shortname of a bookmarked component, ex @OR : OrderRepository.</li>' +
          '<li>Reference to current component : @this</li>' +
          '</ul></div>',
        help: {
          help: 'prints this help',
          get: 'get /some/Component.property [>variable]',
          set: 'set /some/Component.property newvalue',
          go: 'go /to/some/Component - redirects to the component page',
          print: 'print /some/Repository itemDesc id',
          comprefs: 'lists all the available component references',
          vars: 'lists all the available variables'

        },
        errMsg: '<strong>{0}</strong> : {1}<br/> Type <em>help</em> for more information.',
        tableTemplate: '<table class="table"><tr><th>{0}</th><th>{1}</th></tr>{2}</table>',
        rowTemplate: '<tr><td>{0}</td><td>{1}</td></tr>',
        printItemTemplate: '<div class="panel panel-default printItem"><div class="panel-heading">Printing item with id: {0}</div>{1}</div>',
        editorScriptLine: '<option value="{0}">' +
          '{0}' +
          '</option>'
      },

      HIST: [],
      typeahead_base: [],
      //to sync multiple methods
      QUEUE: [],
      //references to components
      COMP_REFS: {},
      //variables
      VARS: {},
      //shell fonctions
      FCT: {

        //get /atg/commerce/order/OrderRepository.repositoryName >toto
        get: function(cmdString, params) {

          var parsedParams = BDA_DASH.parseParams(
            [{
              name: "componentProperty",
              type: "componentProperty"
            }, {
              name: "output",
              type: "output",
              required: false
            }],
            params);
          /*     var outputVar = params[1];*/

          logTrace("parsedParams : " + JSON.stringify(parsedParams));

          BDA_COMPONENT.getProperty(
            parsedParams.componentProperty.path,
            parsedParams.componentProperty.property,
            function(value) {
              if (!isNull(parsedParams.output)) {
                BDA_DASH.VARS[parsedParams.output] = value;
              }
              BDA_DASH.handleOutput(cmdString, params, value, "success");
            });
        },

        //set /atg/commerce/order/OrderRepository.loggingError false
        set: function(cmdString, params) {
          var parsedParams = BDA_DASH.parseParams(
            [{
              name: "componentProperty",
              type: "componentProperty"
            }, {
              name: "value",
              type: "value"
            }],
            params);
          /*     var outputVar = params[1];*/

          logTrace("parsedParams : " + JSON.stringify(parsedParams));

          BDA_COMPONENT.setProperty(
            parsedParams.componentProperty.path,
            parsedParams.componentProperty.property,
            parsedParams.value,
            function(value) {
              BDA_DASH.handleOutput(cmdString, params, value, "success");
            });
        },

        go: function(cmdString, params) {

          var parsedParams = BDA_DASH.parseParams(
            [{
              name: "component",
              type: "component"
            }],
            params);

          BDA_DASH.goToComponent(parsedParams.component);
        },

        echo: function(cmdString, params) {
          var parsedParams = BDA_DASH.parseParams(
            [{
              name: "value",
              type: "value"
            }],
            params);
          var value = parsedParams.value;
          BDA_DASH.handleOutput(cmdString, params, value, "success");
        },

        //print @OR order p92133231
        print: function(cmdString, params) {
          var parsedParams = BDA_DASH.parseParams(
            [{
              name: "repo",
              type: "component"
            }, {
              name: "itemDesc",
              type: "value"
            }, {
              name: "id",
              type: "value"
            }],
            params);
          $().executePrintItem(
            parsedParams.itemDesc,
            parsedParams.id,
            parsedParams.repo,
            function($xmlDoc) {
              try {
                var res = "";
                if (!isNull($xmlDoc)) {
                  $xmlDoc.find('add-item').each(function() {
                    var $itemXml = $(this);
                    res += BDA_DASH.templates.printItemTemplate.format($itemXml.attr('id'), buildSimpleTable($itemXml, BDA_DASH.templates.tableTemplate, BDA_DASH.templates.rowTemplate));
                  })
                  BDA_DASH.handleOutput(cmdString, params, res, "success");
                } else {
                  throw {
                    name: "Not Found",
                    message: "No value"
                  }
                }
              } catch (e) {
                BDA_DASH.handleError(cmdString, e);
              }
            }
          );
        },


        vars: function(cmdString, params) {

          var value = '<pre>{0}</pre>'.format(JSON.stringify(BDA_DASH.VARS, null, 2));
          BDA_DASH.handleOutput(cmdString, params, value, "success");

        },

        comprefs: function(cmdString, params) {

          var value = '<pre>{0}</pre>'.format(JSON.stringify(BDA_DASH.COMP_REFS, null, 2));
          BDA_DASH.handleOutput(cmdString, params, value, "success");

        },

        clear: function(cmdString, params) {
          //BDA_DASH.$screen.find('.alert').each(function(){$(this).alert('close')});
          BDA_DASH.$screen.find('.alert').alert('close');
          BDA_DASH.HIST.push(cmdString);
          BDA_DASH.handleNextQueuedElem();
        },

        history: function(cmdString, params) {
          var value = JSON.stringify(BDA_DASH.HIST);
          BDA_DASH.handleOutput(cmdString, params, value, "success");
        },

        help: function(cmdString, params) {

          var values = [];
          var msg;
          values.push('Available Functions:')
          values.push('<ul>');
          for (var funcName in BDA_DASH.FCT) {
            msg = BDA_DASH.templates.help[funcName];
            if (isNull(msg)) {
              msg = "";
            }
            values.push('<li><strong>{0}</strong> : {1}</li>'.format(funcName, msg))
          }
          values.push('</ul>');
          values.push(BDA_DASH.templates.helpMain);
          msg = values.join('');
          BDA_DASH.handleOutput(cmdString, params, msg, "success");
        }
      },
      build: function() {
        logTrace('actually initialize dash');

        BDA_DASH.initialized = true;

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


        $(consoleHtml).insertAfter(BDA.logoSelector);
        if (BDA_DASH.devMode) {
          $('#dashModal .modal-title').html('DEVMODE');
        }

        BDA_DASH.$input = $('#dashInput');
        BDA_DASH.$screen = $('#dashScreen');
        BDA_DASH.$modal = $('#dashModal');

        //when modal open, focus current tab main input
        BDA_DASH.$modal.on('shown.bs.modal', function() {
          $('#dashFooter .tab-pane.active .main-input').focus();
        })

        //when tab change, focus the main input
        //change the screen size to keep the modal same size
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
          var newTabId = $(e.target).attr("href");
          $(newTabId).find('.main-input').focus();

            var oldTabId = $(e.relatedTarget ).attr("href");
            var diff = parseInt($(newTabId).css('height').replace('px','') )- parseInt($(oldTabId).css('height').replace('px',''));


            var curHeight = $('#dashScreen').css('height');
            curHeight=parseInt(curHeight.replace('px',''));
            var newHeight = curHeight-diff;
            $('#dashScreen').css('height',newHeight+'px');

        });

        //init type ahead with all the existing functions
        for (var funcName in BDA_DASH.FCT) {
          BDA_DASH.typeahead_base.push(funcName);
        }

        BDA_DASH.suggestionEngine = new Bloodhound({
          initialize: true,
          local: BDA_DASH.typeahead_base,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          datumTokenizer: Bloodhound.tokenizers.whitespace
        });

        BDA_DASH.$input.typeahead({
          autoSelect: false
        }, {
          name: 'dash',
          source: BDA_DASH.suggestionEngine
        });

        //bind console input
        BDA_DASH.$input.keypress(function(e) {

          if (e.which == 13 && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            BDA_DASH.handleInput()
            return false;
          }
        });


        BDA_DASH.initCompRefs();

        BDA_DASH.initEditor();

        BDA_DASH.$modal.on("click", ".dash_redo", function(event) {
          BDA_DASH.redo($(this).parent().attr('data-command'));
        });
      },

      submitSaveScriptForm: function() {
        var scriptName = $('#dashSaveScriptName').val();
        var scriptText = $('#dashEditor').val();
        var override = true;
        BDA_DASH.saveScript(scriptName, scriptText, override);
        BDA_DASH.reloadScripts();
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
          console.log('save value: ' + $checkbox.prop('checked'));
        } catch (e) {
          log(e);
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

      deleteScript : function(name){
        console.log('deleting script {0}'.format(name));
        var savedScripts = BDA_STORAGE.getScripts();
        delete savedScripts[name];
        BDA_STORAGE.saveScripts(savedScripts);
        BDA_DASH.reloadScripts();
      },

      loadScript : function(name){
          var savedScripts = BDA_STORAGE.getScripts();
          $('#dashEditor').val(savedScripts[name].text);
          $('#dashSaveScriptName').val(name);
      },

      reloadScripts : function(){
         $('#dashEditorScriptList').html('');

        var savedScripts = BDA_STORAGE.getScripts();
        console.log('savedScripts ' + JSON.stringify( savedScripts));
        var lines = [];
        for (var name in savedScripts) {
          console.log('name ' + name);
          var line = BDA_DASH.templates.editorScriptLine.format(name);
          lines.push(line);
        }

        $(lines.join('')).appendTo(
          $('#dashEditorScriptList')
        );
      },

      initEditor: function() {

        BDA_DASH.$editor=$('#dashEditor');

         $('#dashEditorButton')
          .on('shown.bs.tab', function(e) {

         
            //show/hide buttons
 /*           $('#dashScreen .dash_save').show();
            $('#dashScreen .dash_close').hide();
            $('#dashScreen .dash_redo').hide();
            BDA_DASH.resetSaveState(); //shoudn't be usefull but who knows..*/

          })
          .on('hidden.bs.tab', function(e) {
/*            $('#dashScreen .dash_save').hide();
            $('#dashScreen .dash_close').show();
            $('#dashScreen .dash_redo').show();
            BDA_DASH.resetSaveState();*/
          });

        //bind toggle

        $('#dashScreen').on('click', '.dash_save', function() {
          BDA_DASH.toggleSaveLine()
          return false;
        });


        //bind save
   /*     $('#dashSaveScriptName').keypress(function(e) {
          if (e.which == 13 && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            BDA_DASH.submitSaveScriptForm()
            return false;
          }
        });*/

        $('#dashClearEditor').on('click',BDA_DASH.clearEditor);


        $('#dashSaveEditor').on('click', function() {
          BDA_DASH.submitSaveScriptForm()
        });

        BDA_DASH.reloadScripts();

        $('#dashDeleteScript').on('click',function(){
          var name = $('#dashEditorScriptList').val();
          BDA_DASH.deleteScript(name);
        });

        $('#dashLoadScript').on('click',function(){
          var name = $('#dashEditorScriptList').val();
          BDA_DASH.loadScript(name);
        });

        $('#dashRunEditor').on('click',function(){
          var input = $('#dashEditor').val();
          BDA_DASH.handleInput(input);
        });

      },

      clearEditor :function(){
        BDA_DASH.$editor.val('');
      },

      openDash: function() {
        try {

          if (!BDA_DASH.initialized) {
            BDA_DASH.build();
          }
        } catch (e) {
          console.log(e);
        }

        BDA_DASH.$modal.modal('show');
      },

      handleInput: function(input) {
        try {

          $('#dash_dollar').hide();
          $('#dash_spinner').show();

          if (isNull(input)) {
            input = BDA_DASH.$input.val();
          }
          input = $.trim(input);
          var commands = input.split(/\n|;/);
          logTrace('input: {0}'.format(input));

          BDA_DASH.QUEUE = []; //clear

          try {
            for (var i = 0; i < commands.length; i++) {
              var stringCmd = commands[i];
              stringCmd = $.trim(stringCmd);
              if (!isNull(stringCmd) && stringCmd.length > 0) {
                var command = BDA_DASH.parse(stringCmd);
                BDA_DASH.QUEUE.push([stringCmd, command]);
              }
            }

            //start handling the queue
            BDA_DASH.handleNextQueuedElem();

          } catch (e) {
            BDA_DASH.handleError(input, e);
          }

          BDA_DASH.$input.val('');
        } catch (e) {
          logTrace(e);
        }
      },

      handleNextQueuedElem: function() {
        var cmd = BDA_DASH.QUEUE.shift();
        if (!isNull(cmd)) {
          BDA_DASH.handleCommand(cmd[0], cmd[1]);
        } else {
          $('#dash_dollar').show();
          $('#dash_spinner').hide();
        }
      },

      handleCommand: function(val, command) {
        logTrace('handleCommand:');
        logTrace(JSON.stringify(command));

        var fct = BDA_DASH.FCT[command.funct]
        if (!isNull(fct)) {
          fct(val, command.params);
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
        BDA_DASH.handleOutput(val, null, errMsg, "error");
      },

      handleSysError: function(val, err) {
        logTrace(err);
        var errMsg = BDA_DASH.templates.errMsg.format(err.name, err.message);
        BDA_DASH.writeSysResponse(errMsg, "error");
      },

      //end method, should be always called at the end of a shell function
      handleOutput: function(val, command, result, level) {
        var debug = "";
        if (BDA_DASH.debugMode && command != null) {
          debug = JSON.stringify(command, null, 2);
        }
        var msgClass = BDA_DASH.styles[level];
        var $entry = $(BDA_DASH.templates.screenLine.format(val, debug, result, msgClass));
        $entry.appendTo(BDA_DASH.$screen);

        //add to history after the command is done - not rly clean but will do for now
        //next step is persist the history
        BDA_DASH.saveHistory(val);
        BDA_DASH.$screen.scrollTop(BDA_DASH.$screen[0].scrollHeight);
        BDA_DASH.handleNextQueuedElem();
        return $entry;
      },

      //
      writeSysResponse: function(msg, level) {
        var msgClass = BDA_DASH.styles[level];
        var $entry = $(BDA_DASH.templates.systemResponse.format(msg, msgClass));
        $entry.appendTo(BDA_DASH.$screen);
        BDA_DASH.$screen.scrollTop(BDA_DASH.$screen[0].scrollHeight);
        return $entry;
      },

      saveHistory: function(val) {
        BDA_DASH.HIST.push(val);
        if (!isNull(BDA_DASH.suggestionEngine)) {
          BDA_DASH.suggestionEngine.add([val]);
        }
        //persist history
      },

      goToComponent: function(component) {
        var url = "/dyn/admin/nucleus" + component;
        window.location = url;
      },

      redo: function(input) {
        logTrace("redo : " + input);
        BDA_DASH.handleInput(input);
      },

      getVarValue: function(name) {
        var val = BDA_DASH.VARS[name];
        if (val == undefined || val == null) {
          val = "";
        }
        return val;
      },

      parseParams: function(expected, params) {

        var res = {};

        for (var i = 0; i < expected.length; i++) {
          var exp = $.extend({
            required: true
          }, expected[i]);;
          var inParam = params[i];

          logTrace('parseParams');
          logTrace('exp = ' + JSON.stringify(exp));
          logTrace('inParam = ' + JSON.stringify(inParam));

          if (isNull(inParam)) {

            if (exp.required) {
              throw {
                name: "Missing argument",
                message: "Missing {0} at #{1}".format(exp.name, i + 1)
              }
            }
          } else {
            res[exp.name] = BDA_DASH.getParamValue(exp, inParam);
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
          case 'output':
            res = param.name;
            break;
          default:
            throw {
              name: "Parsing Exception",
              message: "invalid parameter type"
            }
        }
        logTrace("getParamValue : " + res);
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
            res = BDA_DASH.VARS[param.name];
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
          default:
            throw {
              name: "Parsing Exception",
              message: "invalid value type"
            }
        }
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
          property: param.property,
          path: BDA_DASH.getComponent(param.component)
        }

      },

      getComponent: function(componentParam) {
        logTrace('componentParam : ' + JSON.stringify(componentParam));
        var path = "";
        switch (componentParam.type) {
          case "this":
            path = getCurrentComponentPath();
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
            break;
          default:
            throw {
              name: "Parsing Exception",
              message: "invalid component parameter"
            }
        }
        return path;
      },

      parse: function(val) {
        return BDA_DASH_PARSER.parse(val);
      },

      initCompRefs: function() {

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
      }


    };

    console.log('bda.dash.js start');
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
      return this;
    }

    $.fn.openDash = function() {
      BDA_DASH.openDash();
    }

    console.log('bda.dash.js end');


  })(jQuery);
});