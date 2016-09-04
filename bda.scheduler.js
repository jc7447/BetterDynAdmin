"use strict";
jQuery(document).ready(function() {
  (function($) {
    console.log('bda.scheduler.js');

    var BDA_SCHEDULER = {

      initialized:false,

      SCHEDULED_JOBS_SELECTOR: 'h2:contains("Scheduled jobs")',

      isSchedulerPage: function() {

        return $(BDA_SCHEDULER.SCHEDULED_JOBS_SELECTOR).length > 0;
      },

      init: function(){
        var $title = $(BDA_SCHEDULER.SCHEDULED_JOBS_SELECTOR);

        BDA_SCHEDULER.$table = $title.next().children('table:first');
        var $container = $('<div id="timeline-wrapper"></div>');
        $container.append($('<button>Show Timeline</button>').on('click',function(){
          if(!BDA_SCHEDULER.initialized){
            BDA_SCHEDULER.build();
          }
            BDA_SCHEDULER.$timeline.slideToggle();
          
        }))
        BDA_SCHEDULER.$timeline = $('<div id="timeline" style="display:none;"></div>')
        $container.append(BDA_SCHEDULER.$timeline);

        $title.after($container);

        BDA_SCHEDULER.$table.addClass("tablesorter")
        .removeAttr("border")
    .removeAttr("cellpadding").prepend("<thead class='thead' />");
    // Put first tr into a thead tag
  BDA_SCHEDULER.$table.find("tr:eq(0)").appendTo(".thead");
    // Replace td by th
    $('.thead td').each(function() {
      var $this = $(this);
      $this.replaceWith('<th class="' + this.className + '">' + $this.text() + '</th>');
    });
       BDA_SCHEDULER.$table .tablesorter({
                              'theme' : 'blue',
                              'widgets' : ["zebra"],
                              'widgetOptions' : {
                                zebra : [ "normal-row", "alt-row" ]
                              }
    });
      },

      build: function() {
        BDA_SCHEDULER.initialized = true;
        var $tr, $tdList,dst,dateString;
        var dataArray = [];
        //extract the data
         BDA_SCHEDULER.$table.find('tr').each(function(idx, child) {
          //after header and 1 blank row
            $tr = $(child);
            $tdList = $tr.find('td');
          if (idx > 1 && $tdList.length >0) {
            dst = $tdList.eq(7).text();
            //next
            dateString = $tdList.eq(4).text();
            if(!isNull(dst) && dateString !="not yet run"){
              dataArray.push({
                id:'n'+idx,
                content: dst,
                start: new Date(dateString)
              })
            }
            //previous
            dateString = $tdList.eq(3).text();
            if(!isNull(dst) && dateString !="not yet run"){
              dataArray.push({
                id:'p'+idx,
                content: dst,
                start: new Date(dateString)
              })
            }
          }
        });



        // DOM element where the Timeline will be attached
        var container = document.getElementById('timeline');

        // Create a DataSet (allows two way data-binding)
        var items = new vis.DataSet(dataArray);

        // Configuration for the Timeline
        var now = Date.now();
        var options = {
          height: '80%',
          moment: function(date) {
            return vis.moment(date).utc();
          },
          type: 'point',
          selectable: false,
          clickToUse :true,
          orientation:{
            axis:'both'
          },
          start: now - 1000 * 3600,
          end: now + 1000 * 3600 * 12,
          dataAttributes:'all'
        };

        // Create a Timeline
        var timeline = new vis.Timeline(container, items, options);

      },



    };
    // Reference to BDA
    var BDA;
    // Jquery plugin creation

    $.fn.bdaScheduler = function() {
      //init here
      if (BDA_SCHEDULER.isSchedulerPage()) {
        BDA_SCHEDULER.init();
      }

    }

  })(jQuery);
});