// DASH DynAdmin SHell
"use strict";
var BDA;
var BDA_DASH = {

  devMode : false,
  debugMode : false,

  VARS : [],

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
      '<input type="text" class="form-control" id="dashInput" placeholder="" name="query">'+
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
    help:
      '<ul>'+
      '<li>' +
      'help - prints this help'+
      '</li>' +
      '<li>' +
      'get /some/Component.property value [>variable]'+
      '</li>' +
       '<li>' +
      'set /some/Component.property newvalue'+
      '</li>' +
      '<ul>',
    errMsg:
      '<strong>{0}</strong> : {1}<br/> Type <em>help</em> for more information.'
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
      var val = BDA_DASH.$input.val();
      logTrace('input: {0}'.format(val));

      try{
        var commands = BDA_DASH.parse(val);
        for (var i = 0; i < commands.length; i++) {
          var command = commands[i];
          BDA_DASH.handleCommand(val,command);
        }
     
      }catch(e){
        BDA_DASH.handleError(val,e);
      }

      BDA_DASH.$input.val('');
    }catch(e){
      console.log(e);
    }
  },

  handleCommand : function(val,command){
    logTrace('handleCommand:');
    logTrace(JSON.stringify(command));

    switch(command.type) {
      //get /atg/commerce/order/OrderRepository.repositoryName >toto
    case "get":
        BDA_COMPONENT.getProperty(
          command.component,
          command.property,
          function (value) {
            if(! isNull(command.output)){
              BDA_DASH.VARS[command.output] = value;
            }
            BDA_DASH.writeResponse(val,command,value,"success");
          });
        break;
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
    BDA_DASH.$screen.scrollTop(BDA_DASH.$screen[0].scrollHeight);
    return $entry;
  },

  getVarValue : function(name){
    var val = BDA_DASH.VARS[name];
    if(val == undefined || val == null){
      val ="";
    }
    return val;
  },

  goToComponent : function(command){
    var url = "/dyn/admin/nucleus" + command.component;
    window.location=url;
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