(function($) {
  "use strict";
  var BDA_ACTOR = {
    build: function() {
      console.time("bdaActor");
      BDA_ACTOR.isActorChainPage = BDA_ACTOR.isActorChainPageFct();
      BDA_ACTOR.isActorPage = BDA_ACTOR.isActorPageFct();
      if (BDA_ACTOR.isActorChainPage)
        BDA_ACTOR.createActorCaller();
      if (BDA_ACTOR.isActorPage) {
        BDA_ACTOR.completeActorPage();
      }
      console.timeEnd("bdaActor");
    },

    isActorChainPageFct: function() {
      return $("h2:contains('Actor Chain:')").length == 1 && document.URL.indexOf('chainId=') != -1;
    },
    isActorPageFct: function() {
      return $('h2:contains("Actor Chains")').length == 1;
    },


    createActorCaller: function() {
      var componentPathName = getCurrentComponentPath();
      var tableActor = $('table:first');
      var tableActorHeaderRow = tableActor.find('tr:first');
      var tableActorHeaderColumns = tableActorHeaderRow.find('th');
      var tableActorHeaderColumnsCount = tableActorHeaderColumns.length;
      var tableActorDataRow = tableActor.find('tr:eq(1)');
      var tableActorDataRowCells = tableActorDataRow.find('td');
      var actorChainIdValue = $("h2:contains('Actor Chain:')").text().replace("Actor Chain: ", "");

      var inputsHeader = tableActorHeaderColumns.filter(function(index, element) {
        return $(element).text() === "Inputs";
      });
      var inputsIndex = $(inputsHeader).index();
      var tableInputs = $(tableActorDataRow.children().get(inputsIndex)).children().get(0);
      var inputs = [];
      if (tableInputs !== undefined) {
        var inputRows = $(tableInputs).find('tr');
        var inputsSize = inputRows.length;
        for (var i = 1; i < inputsSize; i++) {
          var inputRow = $(inputRows.get(i));
          var name = $(inputRow.children().get(0));
          var value = $(inputRow.children().get(1));
          var isNucleus = value.text().indexOf("nucleus") != -1;
          if (!isNucleus) {
            inputs.push(name.text());
          }
        }
      }
      var inputsHTML = "";
      for (var input in inputs) {
        inputsHTML += inputs[input] + " <textarea name='" + inputs[input] + "'></textarea><br />";
      }
      var url = window.location.origin + '/rest/model' + componentPathName + actorChainIdValue;
      logTrace(url);
      var actorChainCallHtml = "<div id='actorChainCall' border>" + "<h2>Call actor</h2>" + "<a href='javascript:void(0)' id='copyChainUrl'>Copy URL to clipboard</a>";
      if (inputs.length > 0)
        actorChainCallHtml += "<br />Post parameters are " + inputs + "<br />";
      actorChainCallHtml += "<form method='POST' action='/rest/model" + componentPathName + actorChainIdValue + "'>" + inputsHTML + "<button type='submit'>Call <i class='fa fa-play fa-x'></button>" + "</form></div>";

      tableActor.after(actorChainCallHtml);
      $("#copyChainUrl").click(function() {
        copyToClipboard(url);
      });
    },

    completeActorPage: function() {
      BDA_ACTOR.$ACTOR_LIST = $('h2:contains("Actor Chains")').next(); // ul
      processRepositoryXmlDef('definitionFile', (xmlDef) => {
        BDA_ACTOR.$xmlDef = xmlDef;
        BDA_ACTOR.$ACTOR_LIST.find('li').each(function(index, elem) {
          var $elem = $(elem);
          var actorName = $elem.find('a').text();
          let actorDef = '';
          var id = "xml_" + actorName;
          let codeBlock = BDA_ACTOR.addActorXml(actorName, id, $elem);

          $('<button class="showActorXml"><i class="fa fa-code link"></i></button>')
            .on('click', (event) => {
              codeBlock.toggleClass('hidden');
            })
            .appendTo($elem);

        });
      })
    },

    addActorXml: function(actorName, id, $elem) {
      console.log("Show actor XML for chain : " + actorName);

      var xml = BDA_ACTOR.$xmlDef.find("actor-chain[id=" + actorName + "]")[0].outerHTML;
      let wrapper = $("<div class='hidden' id='" + id + "'><pre></pre></div>");
      var $codeBlock = wrapper.insertAfter($elem)
        .find("pre")
        .text(xml);
      highlightAndIndentXml($codeBlock);
      return wrapper;
    },

  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaActor = function(pBDA) {
    console.log('Init plugin {0}'.format('bdaActor'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_ACTOR.build();
    return this;
  };

})(jQuery);