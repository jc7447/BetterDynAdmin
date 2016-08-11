(function($) {
  "use strict";
  var BDA_PERF_MONITOR = {

  isPerfMonitorPage : false,
  isPerfMonitorTimePage : false,

	build : function()
	{
    console.log("isPerfMonitorPage : " + BDA_PERF_MONITOR.isPerfMonitorPage + ", isPerfMonitorTimePage : " + BDA_PERF_MONITOR.isPerfMonitorTimePage);
    BDA_PERF_MONITOR.isPerfMonitorPage = BDA_PERF_MONITOR.isPerfMonitorPageFct();
    BDA_PERF_MONITOR.isPerfMonitorTimePage = BDA_PERF_MONITOR.isPerfMonitorTimePageFct();
    // Setup performance monitor
    if (BDA_PERF_MONITOR.isPerfMonitorPage)
      BDA_PERF_MONITOR.setupPerfMonitorPage();
    // Setup performance monitor time page
    if (BDA_PERF_MONITOR.isPerfMonitorTimePage)
      BDA_PERF_MONITOR.setupPerfMonitorTimePage();

	},

  setupPerfMonitorPage : function()
  {
    BDA_PERF_MONITOR.setupSortingTabPerfMonitor($("table:eq(1)"));
  },

  setupPerfMonitorTimePage : function()
  {
    BDA_PERF_MONITOR.setupSortingTabPerfMonitor($("table:eq(0)"));
  },

  isPerfMonitorPageFct : function()
  {
    return $(location).attr('pathname').indexOf("performance-monitor.jhtml") != -1;
  },

  isPerfMonitorTimePageFct : function()
  {
    return $(location).attr('pathname').indexOf("performance-data-time.jhtml") != -1;
  },

  setupSortingTabPerfMonitor : function($tabSelector)
  {
    $tabSelector.addClass("tablesorter")
    .removeAttr("border")
    .removeAttr("cellpadding");
    $tabSelector.prepend("<thead class='thead' />");
    // Put first tr into a thead tag
    $tabSelector.find("tr:eq(0)").appendTo(".thead");
    // Replace td by th
    $('.thead td').each(function() {
      var $this = $(this);
      $this.replaceWith('<th class="' + this.className + '">' + $this.text() + '</th>');
    });


    
    $tabSelector.tablesorter({
                              'theme' : 'blue',
                              'widgets' : ["zebra"],
                              'widgetOptions' : {
                                zebra : [ "normal-row", "alt-row" ]
                              }
    });
  },

  };
  // Reference to BDA
  var BDA;
  // Jquery plugin creation
  $.fn.bdaPerfMonitor = function(pBDA)
   {
    console.log('Init plugin {0}'.format('bdaPerfMonitor'));
    //settings = $.extend({}, defaults, options);
    BDA = pBDA;
    BDA_PERF_MONITOR.build();
    return this;
  };

})(jQuery);
