(function($) {
  "use strict";
  var BDA_JDBC = {

    isExecuteQueryPage : false,
    connectionPoolPointerComp : "/atg/dynamo/admin/jdbcbrowser/ConnectionPoolPointer/",
    defaultDataSourceDir : "/atg/dynamo/service/jdbc/",

    build : function()
    {
      console.time("bdaJdbc");
      BDA_JDBC.isExecuteQueryPage = BDA_JDBC.isExecuteQueryPageFct();
      if (BDA_JDBC.isExecuteQueryPage)
        BDA_JDBC.setupExecuteQueryPage();
      console.timeEnd("bdaJdbc");
    },

    isExecuteQueryPageFct : function()
    {
      return $(location).attr('pathname').indexOf("executeQuery.jhtml") != -1;
    },


     isJdbcHomePage : function()
    {
      return $(location).attr('pathname').indexOf("jdbcbrowser/index.jhtml") != -1;
    },

    setupExecuteQueryPage : function()
    {
      console.log("Setup execute query page");
      $("<div  id='switchDataSource'/>")
      .append("<p>Query will be execute in data source : <span id='curDataSourceName' > " + " </span></p>")
      .append("<p>Switch data source to : <select id='newDataSource'></select>" +
       "<button id='switchDataSourceBtn'>Enter <i class='fa fa-play fa-x'></i></button></p>" +
       "<p>If you are using a custom data source folder, please add it in the configuration panel of BDA.</p>" +
       "<p>Go to <a href='/dyn/admin/nucleus"+ BDA_JDBC.connectionPoolPointerComp+"'>ConnectionPoolPointer</a></p>")
      .insertAfter($("h1:contains('Execute Query')"));

      BDA_JDBC.getAvailableDataSources();

      BDA_JDBC.getCurrentDataSource(function(data){
        $('#curDataSourceName').html(data);
      })

      $("textarea").prop("id", "sqltext");
      if ($("table").length > 0) {
        $("table").prop("id", "sqlResult").after(
          $('<button></button>', {
            text: 'toCSV'
          }).on('click', function() {
            var csv = $('#sqlResult').toCSV();
            copyToClipboard(csv);
          }));
      }

      $("#switchDataSourceBtn").click(function(){
        var selectedDataSource = $("#newDataSource").val();
        $.ajax({
          type: "POST",
          url : "/dyn/admin/nucleus" + BDA_JDBC.connectionPoolPointerComp,
          data : {"newValue" : BDA_JDBC.defaultDataSourceDir + selectedDataSource, "propertyName" : "connectionPool"},
          async : false
        });
        window.location.reload();
      });
    },

    getAvailableDataSources : function()
    {
      var datasourcesDir = [];
      datasourcesDir.push(BDA_JDBC.defaultDataSourceDir);
      var customDataSources = BDA_STORAGE.getConfigurationValue('data_source_folder');
      if (customDataSources)
        datasourcesDir = datasourcesDir.concat(customDataSources);
      console.log("Folders : " + datasourcesDir);
      console.log(datasourcesDir.length)
      for (var i = 0; i != datasourcesDir.length; i++)
      {
        var datasourceDir = datasourcesDir[i];
        var url = "/dyn/admin/nucleus" + datasourceDir;
        console.log(datasourceDir);
        $.ajax({
          url : url,
          success : function(data) {
            var $newDataSource = $("#newDataSource");
            $(data)
            .find("h3 a")
            .each(function(index, value) {
              var strValue = $(value).text();
              console.log(strValue);
              if (strValue !== null && strValue != "DataSourceInfoCache" && strValue.indexOf("DataSource") != -1)
                $newDataSource.html($newDataSource.html() + "\n<option>" + strValue + "</option>");
            });
          },
        });
      }
    },

    getCurrentDataSource : function(callback)
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
          logTrace(datasource);
          callback(datasource)
        }
      });
    },

    setupJdbcHomePage: function(){
      var $currentDataSourceLink = $('h2:contains("Database"):first').next();
      var $connectionPoolPointerLink = $currentDataSourceLink.next();

      var curDS = $currentDataSourceLink.text();
       $currentDataSourceLink.html('<a href="/dyn/admin/nucleus{0}">{0}</a>'.format(curDS));
       $connectionPoolPointerLink.html('<a href="/dyn/admin/nucleus{0}">{0}</a>'.format(BDA_JDBC.connectionPoolPointerComp));
    },


  };
  // Reference to BDA
  var BDA;
  var BDA_STORAGE;
  // Jquery plugin creation
  $.fn.bdajdbc = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdajdbc'));
    BDA = pBDA;
    BDA_STORAGE = $.fn.bdaStorage.getBdaStorage();
    BDA_JDBC.build();
    return this;
  };

//init here
  if(BDA_JDBC.isJdbcHomePage()){
    BDA_JDBC.setupJdbcHomePage();
  }

})(jQuery);
