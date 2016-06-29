// DASH DynAdmin SHell
"use strict";
var BDA;
var BDA_DASH = {

  devMode : false,
  debugMode : false,

// dom elements
  $screen : null,
  $input : null,
  $modal : null,

  styles : {
    success : "alert-success",
    error : "alert-danger",
    warning : "alert-warning"
  },

  templates : {
    consoleModal : 
      '<div class="twbs">'+
      '<div id="dashModal" class="modal fade" tabindex="-1" role="dialog">'+
      '<div class="modal-dialog modal-lg">'+
      '<div class="modal-content">'+
      '<div class="modal-header">'+
      '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
      '<h4 class="modal-title">DASH - DynAdmin SHell</h4>'+
      '</div>'+
      '<div id="dashScreen" class="modal-body">'+
      '</div>'+
      '<div class="modal-footer">'+
      '<form id="dashForm" class="">'+
      '<div class="form-group">'+
      '<div class="input-group">'+
      '<div class="input-group-addon">$</div>'+
      '<input type="text" class="form-control" id="dashInput" placeholder="" name="cmd" data-provide="typeahead" autocomplete="off">'+
      '</div>'+
      '</div>'+
      '</form>'+
      '</div>'+
      '</div>'+
      '</div>'+
      '</div>'+
      '</div>',
    screenLine : 
      '<div class="dash_screen_line alert {3} alert-dismissible" role="alert">'+
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '<button type="button" class="close"  aria-label="Save"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>'+
      '<button type="button" class="close"  aria-label="Redo"><i class="fa fa-repeat" aria-hidden="true"></i></button>'+
      '<p class="dash_feeback_line">$&gt;&nbsp;{0}</p>'+
      '<p class="dash_debug_line">{1}</p>' +
      '<p class="dash_return_line">{2}</p>' +
      '</div>',
    not_implemented:
      'This command is not implemented yet.',
    help: {
      help : 'prints this help',
      get : 'get /some/Component.property [>variable]',
      set : 'set /some/Component.property newvalue'
    },
    errMsg:
      '<strong>{0}</strong> : {1}<br/> Type <em>help</em> for more information.'
  },

  HIST : [],
  typeahead_base : [],
  VARS : {},
  FCT : {

    //get /atg/commerce/order/OrderRepository.repositoryName >toto
    get: function(cmdString, params) {

      var parsedParams = BDA_DASH.parseParams( 
        [
          {
            name: "componentProperty",
            type: "componentProperty"
          },
          {
            name:"output",
            type:"output",
            required:false
          }
        ],
        params);
      /*     var outputVar = params[1];*/

      logTrace("parsedParams : " + JSON.stringify(parsedParams));

      BDA_COMPONENT.getProperty(
        parsedParams.componentProperty.path,
        parsedParams.componentProperty.property,
        function(value) {
          if(! isNull(parsedParams.output)){
            BDA_DASH.VARS[parsedParams.output] = value;
          }
          BDA_DASH.writeResponse(cmdString, params, value, "success");
        });
    },

    //set /atg/commerce/order/OrderRepository.loggingError false
    set : function(cmdString,params){
        var parsedParams = BDA_DASH.parseParams( 
        [
          {
            name: "componentProperty",
            type: "componentProperty"
          },
          {
            name:"value",
            type:"value"
          }
        ],
        params);
      /*     var outputVar = params[1];*/

      logTrace("parsedParams : " + JSON.stringify(parsedParams));

      BDA_COMPONENT.setProperty(
        parsedParams.componentProperty.path,
        parsedParams.componentProperty.property,
        parsedParams.value,
        function (value) {
          BDA_DASH.writeResponse(cmdString, params, value, "success");
        });
    },

    go : function(cmdString,params){

      var parsedParams = BDA_DASH.parseParams(
        [
          {
            name: "component",
            type: "component"
          }
        ]
        ,
        params);

      BDA_DASH.goToComponent(parsedParams.component);
    },

    echo : function(cmdString,params){
      var parsedParams = BDA_DASH.parseParams( 
        [
          {
            name:"value",
            type:"value"
          }
        ],
        params);
      var value = parsedParams.value;
       BDA_DASH.writeResponse(cmdString, params, value, "success");
    },

    vars : function(cmdString,params){

      var value = JSON.stringify(BDA_DASH.VARS);
      BDA_DASH.writeResponse(cmdString, params, value, "success");

    },

    clear : function(cmdString,params){
      //BDA_DASH.$screen.find('.alert').each(function(){$(this).alert('close')});
      BDA_DASH.$screen.find('.alert').alert('close');
      BDA_DASH.HIST.push(cmdString);
    },

    history : function(cmdString,params){
      var value = JSON.stringify(BDA_DASH.HIST);
      BDA_DASH.writeResponse(cmdString, params, value, "success");
    },

    help : function(cmdString,params){

      var values = [];
      var msg;
      values.push('<ul>');
      for(var funcName  in BDA_DASH.FCT){
        msg = BDA_DASH.templates.help[funcName];
        if(isNull(msg)){
          msg="";
        }
        values.push('<li><strong>{0}</strong> : {1}</li>'.format(funcName,msg))
      }
      values.push('</ul>');
      msg = values.join('');
      BDA_DASH.writeResponse(cmdString, params, msg, "success");
    }

    /*    switch(command.type) {
      //get /atg/commerce/order/OrderRepository.repositoryName >toto
    case "get":
       
    case "set":
        BDA_COMPONENT.setProperty(
          command.component,
          command.property,
          command.value,
          function (value) {
            BDA_DASH.writeResponse(val,command,value,"success");
          });
        break;
    case "help":
        BDA_DASH.writeResponse(val,command,BDA_DASH.templates.help,"success");
        break;
    case "go":
      BDA_DASH.goToComponent(command);
        break;
    case "echo":
        var variable = BDA_DASH.getVarValue(command.name);
        BDA_DASH.writeResponse(val,command,variable,"success");
        break;
    default:
        BDA_DASH.writeResponse(val,command,BDA_DASH.templates.not_implemented,"warning");
    }*/

  },


  build : function()
  {
//toto
      var consoleHtml;

      if(BDA_DASH.devMode){
        $.ajax({
          url:"http://localhost/bda/html/dash.html",
           // only for dev!!
          async : false,
          success : function(data){
              consoleHtml = data;
           }
          }
          );
      }else{
        consoleHtml = BDA_DASH.templates.consoleModal;
      }

      $(consoleHtml).insertAfter(BDA.logoSelector);

      BDA_DASH.$input = $('#dashInput');
      BDA_DASH.$screen = $('#dashScreen');
      BDA_DASH.$modal = $('#dashModal');

      BDA_DASH.$modal.on('shown.bs.modal', function () {
          BDA_DASH.$input.focus();
      })

      BDA_DASH.$input.typeahead({source:BDA_DASH.typeahead, 
            autoSelect: true}); 
      for(var funcName in BDA_DASH.FCT){
        BDA_DASH.typeahead_base.push(funcName);
      }

      BDA_DASH.$input.keypress(function (e) {
        if (e.which == 13) {
          BDA_DASH.handleInput()
          return false;
        }
      });

      $(document).keypress(function(e){
        var char =String.fromCharCode(e.which).toLowerCase();
        var combo=(char === 't' && e.ctrlKey && e.altKey? 1 : 0);
        if (combo ){
          BDA_DASH.openDash();
        }
      });

      //todo add menu button
     // BDA_DASH.openDash();//just put on for now
  },

  openDash : function(){
     BDA_DASH.$modal.modal('show');
  },

  handleInput : function(){
    try{
      var input = BDA_DASH.$input.val();
      input = $.trim(input);
      var commands = input.split("\n");
      logTrace('input: {0}'.format(input));

      try{
        for (var i = 0; i < commands.length; i++) {
          var stringCmd = commands[i];
          stringCmd = $.trim(stringCmd);
          var command = BDA_DASH.parse(stringCmd);
         
          BDA_DASH.handleCommand(stringCmd,command);
        }
     
      }catch(e){
        BDA_DASH.handleError(input,e);
      }

      BDA_DASH.$input.val('');
    }catch(e){
      console.log(e);
    }
  },

  handleCommand : function(val,command){
    logTrace('handleCommand:');
    logTrace(JSON.stringify(command));

    var fct = BDA_DASH.FCT[command.funct]
    if(! isNull(fct)){
      fct(val,command.params);
    }else{
      throw {
        name: "Unknown function",
        message: "This command does not exist."
      }
    }

  },

  handleError : function(val,err){
    logTrace(err);
    var errMsg = BDA_DASH.templates.errMsg.format(err.name , err.message);
     BDA_DASH.writeResponse(val,null,errMsg,"error");
  },


  writeResponse : function(val,command,result,level){
    var debug ="";
    if(BDA_DASH.debugMode && command != null ){
      debug = JSON.stringify(command);
    }
    var msgClass = BDA_DASH.styles[level];
    var $entry = $(BDA_DASH.templates.screenLine.format(val,debug,result,msgClass));
    $entry.appendTo(BDA_DASH.$screen);

    //add to history after the command is done - not rly clean but will do for now
    //next step is persist the history
    BDA_DASH.HIST.push(val); 
    BDA_DASH.$screen.scrollTop(BDA_DASH.$screen[0].scrollHeight);
    return $entry;
  },

  typeahead : function(query,processCallback){
    var suggestions = unique(sort(BDA_DASH.typeahead_base.concat(BDA_DASH.HIST)));
    processCallback(suggestions);
  },

  goToComponent : function(component){
    var url = "/dyn/admin/nucleus" + component;
    window.location=url;
  },

  getVarValue : function(name){
    var val = BDA_DASH.VARS[name];
    if(val == undefined || val == null){
      val ="";
    }
    return val;
  },

  parseParams : function(expected,params){

    var res = {};

    for (var i = 0; i < expected.length; i++) {
      var exp =  $.extend( {required:true},  expected[i]);;
      var inParam =params[i];

      logTrace('parseParams');
      logTrace('exp = ' + JSON.stringify(exp));
      logTrace('inParam = ' + JSON.stringify(inParam));

      if(isNull(inParam)){
        if(exp.required ){
          throw {
            name : "Missing argument",
            message : "Missing {0} at #{1}".format(exp.name,i+1)
          }
        }
      }else{
        res[exp.name] = BDA_DASH.getParamValue(exp,inParam);
      }



    }
    return res;
  },

  //match expected type & actual
  getParamValue : function(exp,param){

    var res;

    switch(exp.type){
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
          name : "Parsing Exception",
          message : "invalid parameter type"
        }
    }
    console.log("getParamValue : " + res);
    return res;
  },


  getValue : function(param){
    console.log('getValue : param : ' + JSON.stringify(param));
    var res = "";
    switch(param.type) {
      case "value":
        res = param.value;
        break;
      case "varRef":
        res = BDA_DASH.VARS[param.name];
        if(isNull(res)){
          throw {
            name : "Invalid Name",
            message : "No such variable {0}".format(param.name)
          }
        }
        break;
      case "component":
        res =  BDA_DASH.getComponent(param);
        break;
      default:
        throw {
          name : "Parsing Exception",
          message : "invalid value type"
        }
    }
    return res;
  },

  getComponentProperty : function(param){

    if(param.type !== 'componentProperty'){
      throw {
          name : "Parsing Exception",
          message : "invalid component type"
        }
    }

    return {
      property:param.property,
      path: BDA_DASH.getComponent(param.component)
    }

  },

  getComponent : function(componentParam){
    console.log('componentParam : ' + JSON.stringify(componentParam));
    var path = "";
    switch(componentParam.type) {
      case "componentPath":
        path = componentParam.path;
        break;
      default:
        throw {
          name : "Parsing Exception",
          message : "invalid component parameter"
        }
    }
    return path;
  },

  parse : function(val){
      return BDA_DASH_PARSER.parse(val);
  }

};

try {
  jQuery(document).ready(function() {
    (function($) {
      logTrace('bda.dash.js start');
        var settings;
        $.fn.initDASH = function(pBDA,options){
          logTrace('Init plugin {0}'.format('DASH'));
          BDA=pBDA;
          BDA_DASH.build();
          return this;
        }

        $.fn.openDash = function(){
          BDA_DASH.openDash();
        }


    })(jQuery);
  });

  logTrace('bda.dash.js end');

} catch (e) {
  console.log(e);
}