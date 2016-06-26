(function($) {
  "use strict";
  var BDA_XML_DEF = {

  isXMLDefinitionFilePage : false,
  xmlDefinitionMaxSize : 150000, // 150 Ko


  build : function()
  {
    BDA_XML_DEF.isXMLDefinitionFilePage = BDA_XML_DEF.isXMLDefinitionFilePageFct();

    if (BDA_XML_DEF.isXMLDefinitionFilePage)
      BDA_XML_DEF.setupXMLDefinitionFilePage();

  },

  isXMLDefinitionFilePageFct : function()
  {
    return $("td:contains('class atg.xml.XMLFile')").length > 0
    || $("td:contains('class [Latg.xml.XMLFile;')").length > 0;
  },

  setupXMLDefinitionFilePage : function()
  {
    var xmlSize = 0;
    $("pre").each(function(index) {
      xmlSize += $(this).html().length;
    });
    console.log("Xml size : " + xmlSize);
    if (xmlSize < BDA_XML_DEF.xmlDefinitionMaxSize)
    {
      highlightAndIndentXml($("pre"));
    }
    else
    {
      $("<p />")
      .html("The definition file is big, to avoid slowing down the page, XML highlight and indentation have been disabled. <br>"
          + "<button id='xmlHighlightBtn'>Highlight and indent now</button> <small>(takes few seconds)</small>")
      .insertAfter($("h3:contains('Value')"));

      $("#xmlHighlightBtn").click(function() {
        highlightAndIndentXml($("pre"));
      });
    }
  },

  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaXmlDef = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdaXmlDef'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_XML_DEF.build();
    return this;
  };

})(jQuery);
