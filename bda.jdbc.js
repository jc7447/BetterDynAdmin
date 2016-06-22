(function($) {
  "use strict";
  var BDA_JDBC = {

    isExecuteQueryPage : false,
    connectionPoolPointerComp : "/atg/dynamo/admin/jdbcbrowser/ConnectionPoolPointer/",
    dataSourceDir : "/atg/dynamo/service/jdbc/",

    build : function()
    {
      BDA_JDBC.isExecuteQueryPage = BDA_JDBC.isExecuteQueryPageFct();
      if (BDA_JDBC.isExecuteQueryPage)
        BDA_JDBC.setupExecuteQueryPage();
    },

    isExecuteQueryPageFct : function()
    {
      console.log($(location).attr('pathname'));
      return $(location).attr('pathname').indexOf("executeQuery.jhtml") != -1;
    },

    setupExecuteQueryPage : function()
    {
      console.log("Setup execute query page");
      $("<div  id='switchDataSource'/>")
      .append("<p>Query will be execute in data source : <span id='curDataSourceName' > " + BDA_JDBC.getCurrentDataSource() + " </span></p>")
      .append("<p>Switch data source to : <select id='newDataSource'>" + BDA_JDBC.getAvailableDataSource() + "</select><button id='switchDataSourceBtn'>Enter <i class='fa fa-play fa-x'></i></button></p>")
      .insertAfter($("h1:contains('Execute Query')"));
      $("textarea").prop("id", "sqltext");
      if ($("table").size() > 0)
        $("table").prop("id", "sqlResult");

      $("#switchDataSourceBtn").click(function(){
        var selectedDataSource = $("#newDataSource").val();
        $.ajax({
          type: "POST",
          url : "/dyn/admin/nucleus" + BDA_JDBC.connectionPoolPointerComp,
          data : {"newValue" : BDA_JDBC.dataSourceDir + selectedDataSource, "propertyName" : "connectionPool"},
          async : false
        });
        window.location.reload();
      });
    },

    getAvailableDataSource : function()
    {
      var datasources = [];
      var url = "/dyn/admin/nucleus" + BDA_JDBC.dataSourceDir;
      $.ajax({
        url : url,
        success : function(data) {
          $(data)
          .find("h3 a")
          .each(function(index, value) {
            var strValue = $(value).text();
            if (strValue !== null && strValue != "DataSourceInfoCache" && strValue.indexOf("DataSource") != -1)
              datasources += "<option>" + strValue + "</option>";
          });
        },
        async : false
      });
      return datasources;
    },

    getCurrentDataSource : function()
    {
      var datasource;
      var url = "/dyn/admin/nucleus" + BDA_JDBC.connectionPoolPointerComp;
      $.ajax({
         "url" : url,
         "success" : function(data) {
          datasource = $(data)
          .find("a:contains('connectionPoolName')")
          .parent()
          .next()
          .find("span")
          .text();
          console.log(datasource);
        },
        "async" : false
      });
      return datasource;
    },

  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdajdbc = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdajdbc'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_JDBC.build();
    return this;
  };

})(jQuery);
