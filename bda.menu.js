try {
  jQuery(document).ready(function() {
    (function($) {
      try {

        var templates = {


        };
        var BDA_MENU = {
          build: function() {
            console.time("bdaMenu");
            var $menuBar = $("<div id='menuBar'></div>").appendTo("body");
            BDA_MENU.$menuBar = $menuBar;
            BDA_MENU.createBugReportPanel($menuBar);
            BDA_MENU.createBackupPanel($menuBar);
            BDA_MENU.createConfigurationPanel($menuBar);
            BDA_MENU.createWhatsnewPanel($menuBar);
            BDA_MENU.createSearchBox($menuBar);
            //generic bind so that new elems are automatically binded
            $menuBar.on("click", ".menu", function(event) {
              var $thisParent = $(this);
              var $panel;
              $('.menu').each(function() {
                var $this = $(this);
                $panel = $('#' + $this.attr('data-panel'));
                if ($this.attr('id') != $thisParent.attr('id') && $panel.css('display') != "none") {
                  $panel.slideToggle();
                  rotateArrow($this.find(".menuArrow i"));
                }
              });

              $panel = $('#' + $thisParent.attr('data-panel'));
              $panel.slideToggle();
              rotateArrow($thisParent.find(".menuArrow i"));
            });
            console.timeEnd("bdaMenu");
          },

          //--- Config Panel
          createConfigurationPanel: function($menuBar) {
            $("<div id='bdaConfig' class='menu' data-panel='bdaConfigPanel'></div>")
              .appendTo($menuBar)
              .html("<p>Configuration</p>" + "<div class='menuArrow'><i class='up fa fa-arrow-down'></i></div>");

            var $bdaConfigPanel = $("<div id='bdaConfigPanel' class='menuPanel'></div>")
              .appendTo("body")
              .html("<p>I want to use the same BDA data on every domains : <input type='checkbox' id='" + BDA_STORAGE.GMValue_MonoInstance + "'>");


            BDA_MENU.createCheckBoxConfig($bdaConfigPanel,{
              name:'search_autocomplete',
              description: 'Search AutoComplete',
              message: '<p>Be aware of perfs impacts. Reload dyn/admin to take into account</p>'
            });

            BDA_MENU.createCheckBoxConfig($bdaConfigPanel,
              {
                description:'Display xmlDef as table by default',
                name:'defaultOpenXmlDefAsTable'
            });

            BDA_MENU.createDefaultMethodsConfig($bdaConfigPanel);

            BDA_MENU.createDataSourceFolderConfig($bdaConfigPanel);

            $('#' + BDA_STORAGE.GMValue_MonoInstance).prop("checked", (GM_getValue(BDA_STORAGE.GMValue_MonoInstance) === true))
              .click(function() {
                var isMonoInstance = $(this).prop('checked');
                console.log("Setting storage mode to mono-instance : " + isMonoInstance);
                GM_setValue(BDA_STORAGE.GMValue_MonoInstance, isMonoInstance);
                if (isMonoInstance)
                  GM_setValue(BDA_STORAGE.GMValue_Backup, JSON.stringify(BDA_STORAGE.getData()));
              });
          },

          //--- Bug report panel
          createBugReportPanel: function($menuBar) {
            $("<div id='bdaBug' class='menu' data-panel='bdaBugPanel'></div>").appendTo($menuBar)
              .html("<p>About</p>" + "<div class='menuArrow'><i class='up fa fa-arrow-down'></i></div>");

            $("<div id='bdaBugPanel' class='menuPanel'></div>").appendTo("body")
              .html("<p>How can I help and stay tuned ? " + "<br /><br /> Better Dyn Admin has a <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin'>GitHub page</a>. <br>" + "Please report any bug in the <a target='_blank' href='https://github.com/jc7447/BetterDynAdmin/issues'>issues tracker</a>. Of course, you can also request new feature or suggest enhancement !" + "<br /><br /> <strong> BDA version " + GM_info.script.version + "</strong> </p>");
          },

          //--- what's new functions --------------------------------------------------------------------------
          createWhatsnewPanel: function($menuBar) {
            $("<div id='whatsnew' class='menu' data-panel='whatsnewPanel'></div>")
              .appendTo($menuBar)
              .html("<p>What's new</p>" + "<div class='menuArrow'><i class='up fa fa-arrow-down'></i></div>");

            $("<div id='whatsnewPanel' class='menuPanel'></div>")
              .appendTo("body")
              .html("<p id='whatsnewContent'></p>");

            $("#whatsnew").click(function() {
              console.log("On click whats new");
              if ($("#whatsnewPanel").css("display") === "none")
                $("#whatsnewContent").html(GM_getResourceText("whatsnew"));
            });
          },

          //--- backup panel functions ------------------------------------------------------------------------

          createBackupPanel: function($menuBar) {
            $("<div id='bdaBackup' class='menu' data-panel='bdaBackupPanel'></div>").appendTo($menuBar)

            .html("<p>Backup</p>" + "<div class='menuArrow'><i class='up fa fa-arrow-down'></i></div>");

            $("<div id='bdaBackupPanel' class='menuPanel'></div>").appendTo("body")

            .html("<p>Why should I save Better Dyn Admin data ? " + "<br /><br /> Because BDA use javascript local storage. You will lose your favorite components and your stored queries if you clean your browser." + "<br /><br /><strong> Remember that you can also import your backup to a BDA in another domain !</strong> </p>" + "<textarea id='bdaData' placeholder='Paste your data here to restore it.'></textarea>" + "<button id='bdaDataBackup'>Backup</button>" + "<button id='bdaDataRestore'>Restore</button>");

            $("#bdaDataBackup").click(function() {
              var data = BDA_STORAGE.getData();
              logTrace('bdaDataBackup ' + data);
              copyToClipboard(JSON.stringify(data));
            });

            $("#bdaDataRestore").click(function() {
              if (window.confirm("Sure ?")) {
                var data = $("#bdaData").val().trim();
                BDA_STORAGE.restoreData(data, true);
              }
            });
          },

          //--- Search
          createSearchBox: function($menuBar) {
            $searchBox = $("<div id='bdaSearch' class='menu' ></div>")
              .appendTo($menuBar)
              .html(
                '<p>Search</p>' + '<form action="/dyn/admin/atg/dynamo/admin/en/cmpn-search.jhtml">' + '<input type="text" name="query" id="searchFieldBDA" placeholder="focus: ctrl+shift+f"></input> ' + '</form>'
              );

            try {

              var autocomplete = BDA_STORAGE.getConfigurationValue('search_autocomplete');
              autocomplete = (autocomplete == true) ? true : false;
              if (autocomplete) {

                $('#searchFieldBDA').bdaSearch({
                  'align': 'right'
                });
              }
            } catch (e) {
              console.error(e);
            }

            $(document).keypress(function(e) {
              var moz = (e.which == 70 && e.ctrlKey && e.shiftKey ? 1 : 0);
              var chrome = (e.which == 6 && e.ctrlKey && e.shiftKey ? 1 : 0);

              if (moz || chrome) {
                $('#searchFieldBDA').focus();
              }
            });

          },

          // advanced config


          createCheckBoxConfig: function(parentPanel,inOptions) {

            var options = $.extend(
              {
                name:null,
                description:null,
                message:''
              },
              inOptions);

            var value = BDA_STORAGE.getConfigurationValue(options.name);
            value = (value == true) ? true : false;
            logTrace('value of {0} = {1}',name  ,value);
            var checked = value ? 'checked="true"' : '';

            parentPanel.append('<p class="config">{0} : <input type="checkbox" id="{1}_config" {2}/></p>{3}'.format(options.description,options.name,checked,options.message));
            $('#{0}_config'.format(options.name)).on('change', function() {
              var val = $(this).is(':checked');
              logTrace('save {0} {1} '.format( options.name, val));
              BDA_STORAGE.storeConfiguration(options.name, val);
            });
          },


          createDefaultMethodsConfig: function(parentPanel) {
            var $config = $('<div id="advancedConfig"></div>');
            $config.appendTo(parentPanel);
            // Default methods
            var savedMethods = BDA_STORAGE.getConfigurationValue('default_methods');
            if (!savedMethods) {
              savedMethods = "";
            }

            $config.append(
              "<p>Default methods when bookmarking components:</p>" + "<textarea id='config-methods-data' class='' placeholder='List of methods names, comma separated'>" + savedMethods + "</textarea>"
            );

            //default methods
            var $submitMethods = $('<button id="config-methods-submit">Save</button>')
              .bind('click', function() {
                var methods = $('#config-methods-data').val().trim();
                var methodsArray = methods.replace(/ /g, '').split(",");
                console.log('storing methods : ' + methodsArray);
                BDA_STORAGE.storeConfiguration("default_methods", methodsArray);
              });
            $config.append($submitMethods);

            // Default properties
            var savedProperties = BDA_STORAGE.getConfigurationValue('default_properties');
            if (!savedProperties) {
              savedProperties = "";
            }

            $config.append(
              "<p>Default properties when bookmarking components:</p>" + "<textarea id='config-properties-data' class='' placeholder='List of properties, comma separated'>" + savedProperties + "</textarea>"
            );

            var $submitProperties = $('<button id="config-properties-submit">Save</button>')
              .bind('click', function() {
                var properties = $('#config-properties-data').val().trim();
                var propertiesArray = properties.replace(/ /g, '').split(",");
                console.log('storing properties : ' + propertiesArray);
                BDA_STORAGE.storeConfiguration("default_properties", propertiesArray);
              });
            $config.append($submitProperties);

            var savedTags = BDA_STORAGE.getTags();
            var tagAsString = "";
            var index = 0;
            var tagsSize = Object.keys(savedTags).length;
            for (var key in savedTags) {
              tagAsString += key;
              if (index < tagsSize) {
                tagAsString += ',';
              }
              index++;
            }
            $config.append(
              "<p>Edit tags:</p>" + "<textarea id='config-tags-data' class='' placeholder='List of tags, comma separated'>" + tagAsString + "</textarea>"
            );

            var $submitTags = $('<button id="config-tags-submit">Save</button>')
              .bind('click', function() {
                var tagString = $('#config-tags-data').val();
                var tags = BDA_TOOLBAR.buildTagsFromString(tagString, false);
                console.log('storing tags : ' + JSON.stringify(tags));
                BDA_TOOLBAR.editTags(tags);
                BDA_TOOLBAR.reloadToolbar();
              });
            $config.append($submitTags);
          },

          createDataSourceFolderConfig: function(parentPanel) {
            var $config = $('<div id="advancedConfig"></div>');
            $config.appendTo(parentPanel);
            // Default folders
            var savedFolders = BDA_STORAGE.getConfigurationValue('data_source_folder');
            if (!savedFolders) {
              savedFolders = "";
            }

            $config.append(
              "<p>Folders for JDBC data source :</p>" + "<textarea id='config-data-source-folders-data' class='' placeholder='List of folder path, comma separated'>" + savedFolders + "</textarea>"
            );

            //save folders
            var $submitMethods = $('<button id="config-data-source-folders-submit">Save</button>')
              .bind('click', function() {
                var folders = $('#config-data-source-folders-data').val().trim();
                var foldersArray = folders.replace(/ /g, '').split(",");
                console.log('storing folders  : ' + foldersArray);
                BDA_STORAGE.storeConfiguration("data_source_folder", foldersArray);
              });
            $config.append($submitMethods);
          },

          createMenuElement: function($element) {
            logTrace('createMenuElement');
            logTrace($element);
            $element.addClass('menu').appendTo(BDA_MENU.$menuBar);
          },
        };

        var defaults = {};
        var settings;
        // Reference to BDA_STORAGE
        var BDA_STORAGE;

        $.fn.bdaMenu = function(options) {
          console.log('Init plugin {0}'.format('bdaMenu'));
          settings = $.extend({}, defaults, options);
          BDA_STORAGE = $.fn.bdaStorage.getBdaStorage();
          BDA_MENU.build();
          return this;
        };

        $.fn.bdaAddMenuElem = function($elem) {
          BDA_MENU.createMenuElement($elem);
          return this;
        };

      } catch (e) {
        console.log(e);
      }
    })(jQuery);
  });

} catch (e) {
  console.log(e);
}
