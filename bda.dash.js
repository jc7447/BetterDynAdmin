// DASH DynAdmin SHell

var BDA_DASH = {

  devMode : true,

  templates : {
    consoleModal : 
      '<div class="twbs"><div id="dashModal" class="modal fade" tabindex="-1" role="dialog">' +
      '<div class="modal-dialog">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '<h4 class="modal-title">DASH - DynAdmin SHell</h4>' +
      '</div>' +
      '<div class="modal-body">' +
      '<p>One fine body&hellip;</p>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
      '<button type="button" class="btn btn-primary">Save changes</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
  },

  $screen : null,
  $input : null,

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

      BDA_DASH.$input.keypress(function (e) {
        if (e.which == 13) {
          BDA_DASH.handleInput()
          return false;
        }
      });
      //todo add menu button
      $('#dashModal').modal('toggle');//just put on for now
  },

  handleInput : function(){
    try{
      var val = BDA_DASH.$input.val();
      logTrace('input: {0}'.format(val));

      $entry = BDA_DASH.feedbackInput(val);

      BDA_DASH.$input.val('');
    }catch(e){
      console.log(e);
    }
  },

  feedbackInput : function(val){
    $entry = $('<div> $&gt; {0}</div>'.format(val));
    $entry.appendTo(BDA_DASH.$screen);
    return $entry;
  }

};

try {
  jQuery(document).ready(function() {
    (function($) {
      console.log('bda.dash.js start');

        var settings;
        $.fn.DASH = function(pBDA,options){
          console.log('Init plugin {0}'.format('DASH'));
          BDA_DASH.build();
          return this;
        }


    })(jQuery);
  });

  console.log('bda.dash.js end');

} catch (e) {
  console.log(e);
}