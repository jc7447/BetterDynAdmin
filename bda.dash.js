// DASH DynAdmin SHell
var BDA;
var BDA_DASH = {

  devMode : false,
  debugMode : true,

// dom elements
  $screen : null,
  $input : null,
  $modal : null,

  styles : {
    success : "alert-success",
    error : "alert-danger"
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
      '<input type="text" class="form-control" id="dashInput" placeholder="">'+
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
      '<p class="dash_feeback_line">$&gt;&nbsp;{0}</p>'+
      '<p class="dash_debug_line">{1}</p>' +
      '<p class="dash_return_line">{2}</p>' +
      '</div>'
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

      BDA_DASH.$input.keypress(function (e) {
        if (e.which == 13) {
          BDA_DASH.handleInput()
          return false;
        }
      });
      //todo add menu button
      BDA_DASH.openDash();//just put on for now
  },

  openDash : function(){
     BDA_DASH.$modal.modal('toggle');
     BDA_DASH.$input.focus();
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
    console.log('handleCommand:');
    console.log(JSON.stringify(command));
    console.log(command.type);
    if(command.type == "get"){
      console.log('type : get');
      BDA_COMPONENT.getProperty(
        command.component,
        command.property,
        function (value) {
          BDA_DASH.writeResponse(val,command,value,"success");
        });
    }
  },

  handleError : function(val,err){
    console.log(err);
    var errMsg = err.name + " : " + err.message;
     BDA_DASH.writeResponse(val,null,errMsg,"error");
  },


  writeResponse : function(val,command,result,level){
    var debug ="";
    if(BDA_DASH.debugMode && command != null ){
      debug = JSON.stringify(command);
    }
    var msgClass = BDA_DASH.styles[level];
    $entry = $(BDA_DASH.templates.screenLine.format(val,debug,result,msgClass));
    $entry.appendTo(BDA_DASH.$screen);
    BDA_DASH.$screen.scrollTop(BDA_DASH.$screen[0].scrollHeight);
    return $entry;
  },

  parse : function(val){
      return BDA_DASH_PARSER.parse(val);
  }

};

try {
  jQuery(document).ready(function() {
    (function($) {
      console.log('bda.dash.js start');

        

        var settings;
        $.fn.DASH = function(pBDA,options){
          console.log('Init plugin {0}'.format('DASH'));
          BDA=pBDA;
          BDA_DASH.build();
          return this;
        }


    })(jQuery);
  });

  console.log('bda.dash.js end');

} catch (e) {
  console.log(e);
}