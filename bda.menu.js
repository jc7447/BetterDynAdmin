try {
  jQuery(document).ready(function() {
    (function($) {
      console.log('bda.menu.js start');
      try {

        var templates = {


        };
        var BDA_MENU = {
          build : function()
          {
            console.log('bda menu.build');
            var $menuBar = $("<div id='menuBar'></div>").appendTo("body");
            BDA_MENU.createBugReportPanel($menuBar);
            BDA_MENU.createBackupPanel($menuBar);
            BDA_MENU.createConfigurationPanel($menuBar);
            BDA_MENU.createWhatsnewPanel($menuBar);
            BDA_MENU.createSearchBox($menuBar);

            $(".menu").bind("click",function() {
              var $thisParent = $(this);
              var $panel;
              $('.menu').each(function() {
                var $this = $(this);
                $panel = $('#' + $this.attr('data-panel'));
                if($this.attr('id') != $thisParent.attr('id') && $panel.css('display') != "none")
                {
                      $panel.slideToggle();
                      BDA.rotateArrow($this.find(".menuArrow i"));
                }
              });

              $panel = $('#' + $thisParent.attr('data-panel'));
              $panel.slideToggle();
              BDA.rotateArrow($thisParent.find(".menuArrow i"));
            });
          },

          //--- Config Panel
          createConfigurationPanel : function($menuBar)
          {
            $("<div id='bdaConfig' class='menu' data-panel='bdaConfigPanel'></div>")
            .appendTo($menuBar)
            .html("<p>Configuration</p>"
                + "<div class='menuArrow'><i class='up fa fa-arrow-down'></i></div>"
            );

            var $bdaConfigPanel = $("<div id='bdaConfigPanel' class='menuPanel'></div>")
            .appendTo("body")
            .html("<p>I want to use the same BDA data on every domains : <input type='checkbox' id='" + BDA.GMValue_MonoInstance + "'>");

            BDA.createDefaultMethodsConfig($bdaConfigPanel);

            $('#' + BDA.GMValue_MonoInstance).prop("checked", (GM_getValue(BDA.GMValue_MonoInstance) === true))
            .click(function() {
              var isMonoInstance = $(this).prop('checked');
              console.log("Setting storage mode to mono-instance : " + isMonoInstance);
              GM_setValue(BDA.GMValue_MonoInstance, isMonoInstance);
              if(isMonoInstance)
                GM_setValue(BDA.GMValue_Backup, JSON.stringify(BDA.getData()));
            });

            $("#bdaDataBackup").click(function () {
              var data = BDA.getData();
              BDA.copyToClipboard(JSON.stringify(data));
            });

            $("#bdaDataRestore").click(function () {
              if (window.confirm("Sure ?"))
              {
                var data = $("#bdaData").val().trim();
                BDA.restoreData(data, true);
              }
            });

          },

          //--- Bug report panel
          createBugReportPanel : function($menuBar)
          {
            $("<div id='bdaBug' class='menu' data-panel='bdaBugPanel'></div>").appendTo($menuBar)
                .html("<p>About</p>"
                + "<div class='menuArrow'><i class='up fa fa-arrow-down'></i></div>"
            );

            $("<div id='bdaBugPanel' class='menuPanel'></div>").appendTo("body")
            .html("<p>How can I help and stay tuned ? "
                + "<br /><br /> Better Dyn Admin has a <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin'>GitHub page</a>. <br>"
                + "Please report any bug in the <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin/issues'>issues tracker</a>. Of course, you can also request new feature or suggest enhancement !"
                + "<br /><br /> <strong> BDA version " + GM_info.script.version + "</strong> </p>"
            );
          },

          //--- what's new functions --------------------------------------------------------------------------
          createWhatsnewPanel : function ($menuBar)
          {
            $("<div id='whatsnew' class='menu' data-panel='whatsnewPanel'></div>")
            .appendTo($menuBar)
            .html("<p>What's new</p>"
            + "<div class='menuArrow'><i class='up fa fa-arrow-down'></i></div>");

            $("<div id='whatsnewPanel' class='menuPanel'></div>")
            .appendTo("body")
            .html("<p id='whatsnewContent'></p>");

            $("#whatsnew").click(function() {
              console.log("On click whats new");
              if ($("#whatsnewPanel").css("display") === "none")
                $( "#whatsnewContent" ).html(GM_getResourceText("whatsnew") );
            });
          },

          //--- backup panel functions ------------------------------------------------------------------------

          createBackupPanel : function ($menuBar)
          {
            $("<div id='bdaBackup' class='menu' data-panel='bdaBackupPanel'></div>").appendTo($menuBar)

            .html("<p>Backup</p>"
                + "<div class='menuArrow'><i class='up fa fa-arrow-down'></i></div>"
            );

            $("<div id='bdaBackupPanel' class='menuPanel'></div>").appendTo("body")

            .html("<p>Why should I save Better Dyn Admin data ? "
                + "<br /><br /> Because BDA use javascript local storage. You will lose your favorite components and your stored queries if you clean your browser."
                + "<br /><br /><strong> Remember that you can also import your backup to a BDA in another domain !</strong> </p>"
                + "<textarea id='bdaData' placeholder='Paste your data here to restore it.'></textarea>"
                + "<button id='bdaDataBackup'>Backup</button>"
                + "<button id='bdaDataRestore'>Restore</button>"
            );

            $("#bdaDataBackup").click(function (){
              var data = BDA.getData();
              BDA.copyToClipboard(JSON.stringify(data));
            });

            $("#bdaDataRestore").click(function (){
              if (window.confirm("Sure ?"))
              {
                var data = $("#bdaData").val().trim();
                BDA.restoreData(data, true);
              }
            });
          },

          //--- Search
          createSearchBox : function($menuBar){
            $searchBox = $("<div id='bdaSearch' class='menu' ></div>")
                            .appendTo($menuBar)
                            .html(
                              '<p>Search</p>'
                            + '<form action="/dyn/admin/atg/dynamo/admin/en/cmpn-search.jhtml">'
                            + '<input type="text" name="query" id="searchFieldBDA" placeholder="focus: ctrl+shift+f"></input> '
                            + '</form>'
                            );

            $(document).keypress(function(e){
              var moz=(e.which == 70 && e.ctrlKey && e.shiftKey? 1 : 0);
              var chrome=(e.which == 6 && e.ctrlKey && e.shiftKey? 1 : 0);

              if (moz || chrome){
               $('#searchFieldBDA').focus();
            }
           });
          },
 

          a : function(){

          }
        };

        var defaults = {};
        var settings;
        var BDA;

        $.fn.bdaMenu = function(pBDA,options){
          console.log('Init plugin {0}'.format('bdaMenu'));
          settings = $.extend({}, defaults, options);
          BDA=pBDA;
          BDA_MENU.build();
          return this;
        }

      } catch (e) {
        console.log(e);
      }

    })(jQuery);
  });

  console.log('bda.menu.js end');

} catch (e) {
  console.log(e);
}