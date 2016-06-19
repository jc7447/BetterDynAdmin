(function($) {
  var BDA_PIPELINE = {

    $pipelineDef : null,
    network : null,
    options : {
               width : "100%",
               height: "550px",
               interaction : {
                  zoomView : true,
                  selectable : true,
                  dragNodes : false,
                  dragView : true,
                  hover : false
               },
              layout : {
                   hierarchical : {
                     direction : "LR",
                     sortMethod : "directed",
                     nodeSpacing : 300,
                     levelSeparation : 250
                 }
               },
               edges: {
                  smooth: {
                      type: 'cubicBezier',
                      forceDirection: 'horizontal',
                      roundness: 0.4
                  },
                },
                nodes: {
                  font : {
                    size : 11
                  },
                  shape : "box"
                },
                physics:false
    },
    isPipelineManagerPage : false,

    build : function()
    {
      BDA_PIPELINE.isPipelineManagerPage = BDA_PIPELINE.isPipelineManagerPageFct();
      if(this.isPipelineManagerPage)
        BDA_PIPELINE.setupPipelineManagerPage();
    },

    isPipelineManagerPageFct : function()
    {
        return $("h2:contains('Pipeline Chains')").size() === 1;
    },

    setupPipelineManagerPage : function()
    {
      //create diagram container
      $("h2:contains('Pipeline Chains')").append("<div class='popup_block' id='pipelinePopup'>"
                                                 + "<div><a href='javascript:void(0)' class='close'><i class='fa fa-times'></div>"
                                                 + "<div><h3></h3></div></i></a>"
                                                 + "<button id='schemeOrientation'>Switch orientation <i class='fa fa-retweet'></button>"
                                                 + "<div id='pipelineScheme'></div></div>");
      $("#pipelinePopup .close").click(function() {
        $("#pipelinePopup").fadeOut();
      });

      var $pipelineTable = $("h2:contains('Pipeline Chains')").next().attr("id", "pipelineTable");
      $pipelineTable.find("tr:nth-child(odd)").addClass("odd");
      $pipelineTable.find("tr:first").append("<th>Show XML</th><th>Show graph</th>");
      $pipelineTable.find("tr:gt(0)").append("<td align='center'><i class='fa fa-code link'></i></td><td align='center'><i class='fa fa-eye link'></i>"
                                           + "<sup style='font-size:8px'>&nbsp;BETA</sup></td>");
      //process pipeline definition file
      BDA.processRepositoryXmlDef("definitionFile", function($xmlDef)
      {
          BDA_PIPELINE.$pipelineDef = $xmlDef;
          $pipelineTable.find('tr').each(function(index, elem)
          {
              var $elem = $(elem);
              var chainName = $elem.find("td:eq(0)").text();
              $elem.attr("id", chainName);
              $elem.find("td:eq(7)").click(function() {
                var $td = $(this);
                if ($td.hasClass("open"))
                {
                  $td.removeClass("open");
                  BDA_PIPELINE.hidePipelineXml(chainName);
                }
                else
                {
                  $td.addClass("open");
                  BDA_PIPELINE.showPipelineXml(chainName, $elem.hasClass("odd"));
                }
              });

              $elem.find("td:eq(8)").click(function() {
                // Redset direction
                BDA_PIPELINE.options.layout.hierarchical.direction = "LR";
                BDA_PIPELINE.showPipelineGraph(chainName);
              });
          });
      });
    },

    hidePipelineXml : function(chainName)
    {
      var trId = "xml_" + chainName;
      $("#" + trId).remove();
    },

    showPipelineXml : function(chainName, isOdd)
    {
      console.log("Show pipeline XML for chain : " + chainName + " isOdd : " + isOdd);
      var trId = "xml_" + chainName;

      if ($("#" + trId).size() === 0) {
        var xml = BDA_PIPELINE.$pipelineDef.find("pipelinechain[name=" + chainName + "]")[0].outerHTML;
        var $codeBlock = $("<tr id='" + trId + "'><td colspan='9'><pre></pre></td></tr>")
        .insertAfter("#" + chainName)
        .find("pre")
        .text(xml);
        if (isOdd)
          $("#" + trId).addClass("odd");
        BDA.highlightAndIndentXml($codeBlock);
      }
    },

    showPipelineGraph : function(chainName)
    {
      console.log("Show pipeline graph for chain : " + chainName);
      $("#pipelinePopup h3").text(chainName);
      $("#pipelinePopup").show();
      var container = document.getElementById('pipelineScheme');
      var data = BDA_PIPELINE.createNodesAndEdges(chainName);

      BDA_PIPELINE.drawGraph(container, data);

      $('#schemeOrientation').unbind( "click" );
      $('#schemeOrientation').click(function(){
        console.log("Swith orientation, current : " + BDA_PIPELINE.options.layout.hierarchical.direction);
        BDA_PIPELINE.network.destroy();
        if(BDA_PIPELINE.options.layout.hierarchical.direction === "LR")
            BDA_PIPELINE.options.layout.hierarchical.direction = "UD";
        else
            BDA_PIPELINE.options.layout.hierarchical.direction = "LR";
        console.log("Swith orientation, new : " + BDA_PIPELINE.options.layout.hierarchical.direction);
        BDA_PIPELINE.drawGraph(container, data);
      });
    },

    drawGraph : function(container, data)
    {
       // Actually renders into container
        BDA_PIPELINE.network = new vis.Network(container, data, BDA_PIPELINE.options);
        // Make node clickable
        BDA_PIPELINE.network.on("click", function (params) {
          console.log("click on the network");
          console.log(params);
          var id = params.nodes[0];
          if (id !== undefined)
          {
            console.log(data.nodes.get(id).pipelineLinkPath);
            var url = "/dyn/admin/nucleus/" + data.nodes.get(id).pipelineLinkPath;
            window.open(url, '_blank');
          }
          else
            console.log("Not clicked on a node");
        });
    },

    createNodesAndEdges : function(chainName)
    {
      var $chainDef = BDA_PIPELINE.$pipelineDef.find('pipelinechain[name=' + chainName + ']');
      var nodes = new vis.DataSet();
      var edges = new vis.DataSet();
      $chainDef.find('pipelinelink').each(function(pipelinelinkIndex, pipelinelinkElement){
          var pipelineLinkName = $(pipelinelinkElement).attr('name');
          console.log("link : "  + pipelineLinkName);
          var processor = $(pipelinelinkElement).find('processor');
          var pipelineLinkPath = $(processor).attr('jndi');
          if(pipelineLinkPath === undefined)
              pipelineLinkPath = $(processor).attr('class');
         nodes.add({id : pipelinelinkIndex, label : pipelineLinkName, name : pipelineLinkName, pipelineLinkPath : pipelineLinkPath});
        });

        $chainDef.find('pipelinelink').each(function(pipelinelinkIndex, pipelinelinkElement)
        {
          var pipelineLinkName = $(pipelinelinkElement).attr('name');
          $(pipelinelinkElement).find('transition').each(function() {
            var transitionName = $(this).attr("link");
            edges.add({from : BDA_PIPELINE.findNodeId(nodes, pipelineLinkName), to : BDA_PIPELINE.findNodeId(nodes, transitionName), arrows : 'to', label : $(this).attr("returnvalue")});
          });

        });

      console.log({"edges" : edges, "nodes" : nodes});
      return {"edges" : edges, "nodes" : nodes};
    },

    findNodeId : function(nodes, name)
    {
      var id;
       nodes.forEach(function(nodeElement, nodeIndex){
         if (nodeElement.name == name)
         {
           id = nodeElement.id;
           return ;
         }
       });
        return id;
    },

  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaPipeline = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdaRepository'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_PIPELINE.build();
    return this;
  };

})(jQuery);
