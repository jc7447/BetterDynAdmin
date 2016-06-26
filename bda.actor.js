(function($) {
  "use strict";
  var BDA_ACTOR = {
    build : function()
    {
      BDA_ACTOR.isActorChainPage = BDA_ACTOR.isActorChainPageFct();

      if (BDA_ACTOR.isActorChainPage)
          BDA_ACTOR.createActorCaller();
    },

    isActorChainPageFct : function()
    {
        return $("h2:contains('Actor Chain:')").length == 1 && document.URL.indexOf('chainId=') != -1;
    },

    createActorCaller : function()
    {
      var componentPathName = getCurrentComponentPath();
      var tableActor = $('table:first');
      var tableActorHeaderRow = tableActor.find('tr:first');
      var tableActorHeaderColumns = tableActorHeaderRow.find('th');
      var tableActorHeaderColumnsCount = tableActorHeaderColumns.length;
      var tableActorDataRow = tableActor.find('tr:eq(1)');
      var tableActorDataRowCells = tableActorDataRow.find('td');
      var actorChainIdValue = $("h2:contains('Actor Chain:')").text().replace("Actor Chain: ", "");

      var inputsHeader = tableActorHeaderColumns.filter(function(index, element){
        return $(element).text() === "Inputs";
      });
      var inputsIndex = $(inputsHeader).index();
      var tableInputs = $(tableActorDataRow.children().get(inputsIndex)).children().get(0);
      var inputs = [];
      if(tableInputs !== undefined)
      {
          var inputRows = $(tableInputs).find('tr');
          var inputsSize = inputRows.length;
          for(var i = 1; i < inputsSize; i++)
          {
              var inputRow = $(inputRows.get(i));
              var name = $(inputRow.children().get(0));
              var value = $(inputRow.children().get(1));
              var isNucleus = value.text().indexOf("nucleus") != -1;
              if(!isNucleus)
              {
                  inputs.push(name.text());
              }
          }
      }
      var inputsHTML = "";
      for(var input in inputs)
      {
          inputsHTML += inputs[input] + " <textarea name='" + inputs[input] + "'></textarea><br />";
      }
      var url = window.location.origin + '/rest/model' + componentPathName + actorChainIdValue;
      console.log(url);
      var actorChainCallHtml = "<div id='actorChainCall' border>"
          + "<h2>Call actor</h2>"
          + "<a href='javascript:void(0)' id='copyChainUrl'>Copy URL to clipboard</a>";
          if (inputs.length > 0)
            actorChainCallHtml += "<br />Post parameters are " + inputs + "<br />";
          actorChainCallHtml += "<form method='POST' action='/rest/model" + componentPathName + actorChainIdValue + "'>"
          + inputsHTML
          + "<button type='submit'>Call <i class='fa fa-play fa-x'></button>"
          + "</form></div>";

      tableActor.after(actorChainCallHtml);
      $("#copyChainUrl").click(function(){
        copyToClipboard(url);
      });
    },

  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaActor = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdaActor'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_ACTOR.build();
    return this;
  };

})(jQuery);
