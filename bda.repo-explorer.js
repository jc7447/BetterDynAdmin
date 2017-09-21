// Extension for DASH
try {
  jQuery(document).ready(function() {
    (function($) {
      try {

        var BDA_REEX = {

          config: {
            queries: {
              print: {
                writable: false,
                template: 'print {repository} {itemDescriptor} {id}',
                fields: {
                  id: true,
                  repository: true,
                  itemDescriptor: true,
                  text: false
                }
              },
              query: {
                writable: true,
                template: 'query {repository} {itemDescriptor} {{text}}',
                fields: {
                  id: false,
                  repository: true,
                  itemDescriptor: true,
                  text: true
                }
              },
              add: {
                writable: true,
                fields: {
                  id: true,
                  repository: true,
                  itemDescriptor: true,
                  text: false
                }
              },
              remove: {
                writable: false,
                template: 'rql {repository} {<remove-item item-descriptor="{itemDescriptor}" id="{id}"/>}',
                fields: {
                  id: true,
                  repository: true,
                  itemDescriptor: true,
                  text: false
                }
              },
              freeRql: {
                writable: true,

                template: 'rql {repository} {{text}}',
                fields: {
                  id: false,
                  repository: true,
                  itemDescriptor: true,
                  text: false
                }
              }
            }
          },

          templates: {

            menuPill: '<li role="presentation"><a id="repoExplorerButton"  href="#repo-explorer-tab" aria-controls="editor" role="tab" data-toggle="tab" data-cols="1" data-fs-mode="true">Repo Explorer</a></li>',
            panel: '<div role="tabpanel" class="tab-pane fade bottom-panel" id="repo-explorer-tab">' +
              '<form id="dashEditorForm" class="form-horizontal">' +
              '<div class="form-group top-row">' +
              '<div class="col-sm-2">' +
              '<select id="reexQueryType" class="form-control reex-input">' +
              '<option data-queryable="false">print</option>' +
              '<option data-queryable="true">query</option>' +
              //  '<option data-queryable="true">add</option>' +
              '<option data-queryable="false">remove</option>' +
              '<option data-queryable="true">freeRql</option>' +
              '</select>' +
              '</div>' +
              '<div class="col-sm-4">' +
              '<input type="text" id="reexRepo" class="form-control reex-input" placeholder="repository">' +
              '</input>' +
              '</div>' +
              '<div class="col-sm-2">' +
              '<input type="text" id="reexItemDesc" class="form-control reex-input" placeholder="item descriptor">' +
              '</input>' +
              '</div>' +
              '<div class="col-sm-2">' +
              '<input type="text" id="reexId" class="form-control reex-input" placeholder="id">' +
              '</input>' +
              '</div>' +
              '<div class="col-sm-2">' +
              '<div class="btn-group" role="group" >' +
              '<button type="button" id="reexClear" class="btn btn-primary" title="clear">' +
              '<i class="fa fa-eraser" />&nbsp;' +
              '</i>' +
              '</button>' +
              '<button type="button" id="reexRun" class="btn btn-primary " title="run">' +
              '<i class="fa fa-play" />&nbsp;' +
              '</i>' +
              '</button>' +
              '</div>' +
              '</div>' +
              '</div>' +
              '<div class="form-group middle-row">' +
              '<div class="col-sm-6">' +
              '<textarea id="reexEditor" class="form-control dash-input main-input reex-input reex-autocomplete" rows="4" placeholder=""></textarea>' +
              '</div>' +
              '<div class="col-sm-6">' +
              '<div id="reexPreview">preview</div><br/>' +
              '<div id="reexPreviewRql" class="xml"><pre><code></code></pre></div>' +
              '</div>' +
              '</div>' +
              '</form>' +
              '</div>',
          },

          build: function() {
            $('body').on('bda.dash.build.done', () => {
              console.log('init Repo Explorer')
              let navPill = $(BDA_REEX.templates.menuPill);
              BDA_DASH.$footer.find('#dashNav').append(navPill);
              BDA_REEX.$panel = $(BDA_REEX.templates.panel);
              BDA_DASH.$control.append(BDA_REEX.$panel);
              BDA_REEX.$preview = BDA_REEX.$panel.find('#reexPreview');
              BDA_REEX.$previewRql = BDA_REEX.$panel.find('#reexPreviewRql');

              BDA_REEX.fields = {
                id: BDA_REEX.$panel.find('#reexId'),
                itemDescriptor: BDA_REEX.$panel.find('#reexItemDesc'),
                repository: BDA_REEX.$panel.find('#reexRepo'),
                text: BDA_REEX.$panel.find('#reexEditor'),
                type: BDA_REEX.$panel.find('#reexQueryType')
              }

              BDA_DASH.bindTabChangeResize(navPill.find('a[data-toggle="tab"]'));
              BDA_REEX.initQueryTypeSelect();

              var defaultTab = BDA_STORAGE.getConfigurationValue('dashDefaultTab');
              if (!isNull(defaultTab)) {
                $('#' + defaultTab).tab('show');
              }

              BDA_REEX.$submit = BDA_REEX.$panel.find('#reexRun');
              BDA_REEX.$submit.on('click', BDA_REEX.submit)

              //restore inputs
              let inputAsString = BDA_STORAGE.getConfigurationValue('reexCurrentInputs');
              if (!_.isNil(inputAsString)) {
                let inputs = JSON.parse(inputAsString);
                BDA_REEX.fields.id.val(inputs.id);
                BDA_REEX.fields.itemDescriptor.val(inputs.itemDescriptor);
                BDA_REEX.fields.text.val(inputs.text);
                BDA_REEX.fields.type.val(inputs.queryType);
                BDA_REEX.fields.repository.val(inputs.repository);
              }

              var autosaveFc = debounce(function() {
                  try {

                    var inputs = BDA_REEX.getInputs()
                    let inputAsString = JSON.stringify(inputs);
                    BDA_STORAGE.storeConfiguration('reexCurrentInputs', inputAsString);
                  } catch (e) {
                    console.error(e);
                  }
                },
                300);

              // bind preview
              BDA_REEX.$panel.find('.reex-input')
                .on('keyup', BDA_REEX.updatePreview)
                .on('change', BDA_REEX.updatePreview)
                .on('keyup', autosaveFc)
                .on('change', autosaveFc)

              BDA_REEX.fields.repository.on('change', BDA_REEX.reloadRepositoryDefinition)

              BDA_REEX.updatePreview(); // init on build



              BDA_REEX.reloadRepositoryDefinition();
              BDA_REEX.initFieldsAutocomplete();
            })
          },

          initFieldsAutocomplete: function() {
            BDA_REEX.initRepositoryAutocomplete()
          },

          initRepositoryAutocomplete: function() {
            let settings = $().getBdaSearchSuggestionEngineOptions();
            var comps = BDA_STORAGE.getStoredComponents();
            // settings.local = _.map(comps, (fav) => {
            //   return {
            //     path: fav.componentPath.replace(/\/dyn\/admin\/nucleus/g, '').replace(/\/$/g, ''),
            //     value: fav.componentName
            //   }
            // });
            //  settings.remote = null;
            console.log(settings.local)

            let completionEngine = new Bloodhound(settings);
            //init typeahead
            BDA_REEX.fields.repository.typeahead({
              highlight: true,
              hint: false,
              minLength: 3,
            }, {
              name: 'reexRepository',
              source: completionEngine,
              displayKey: 'value',
              limit: 5,
            });

          },


          reloadRepositoryDefinition: function() {
            processRepositoryXmlDef('definitionFiles', ($xmlDef) => {
              try {

                if (!_.isNil($xmlDef) && $xmlDef.length > 0) {

                  //BDA_REEX.fields.descriptors.
                  let itemDescriptors = [];
                  var $descriptors = $xmlDef.find("item-descriptor");
                  $descriptors.each((index, desc) => {
                    itemDescriptors.push(desc.getAttribute('name'));
                  })
                  itemDescriptors = sort(itemDescriptors);
                }

              } catch (e) {
                console.error(e);
              }
            }, BDA_REEX.fields.repository.val())

          },


          updatePreview: function() {
            let queryType = BDA_REEX.fields.type.val();
            let dashQuery = BDA_REEX.formatQuery(BDA_REEX.config.queries[queryType].template, BDA_REEX.getInputs());
            let rql = BDA_REPOSITORY.previewRql(queryType, BDA_REEX.getInputs());
            BDA_REEX.$preview.html('> ' + dashQuery);
            BDA_REEX.$previewRql.find('code').text(rql);
            BDA_REEX.$previewRql.each(function(i, block) {
              hljs.highlightBlock(block);
            })
          },

          submit: function() {

            try {

              let queryType = BDA_REEX.fields.type.val();
              let dashQuery = BDA_REEX.formatQuery(BDA_REEX.config.queries[queryType].template, BDA_REEX.getInputs());
              BDA_DASH.handleInput(dashQuery);

            } catch (e) {
              console.error(e);
            }
          },

          getInputs() {
            return {
              id: BDA_REEX.fields.id.val(),
              text: BDA_REEX.fields.text.val(),
              repository: BDA_REEX.fields.repository.val(),
              itemDescriptor: BDA_REEX.fields.itemDescriptor.val(),
              queryType: BDA_REEX.fields.type.val()
            }
          },

          formatQuery: function(query, params) {
            let result = query;
            _.forEach(params, (value, key) => {
              result = result.replace('{' + key + '}', value);
            })
            return result;
          },


          initQueryTypeSelect: function() {
            BDA_REEX.fields.type.on('change', BDA_REEX.updateEditorState);
            BDA_REEX.updateEditorState(); //init
          },
          updateEditorState: function() {
            let $option = BDA_REEX.fields.type.find(':selected');
            let opt = $option.val();


            let inputConfig = BDA_REEX.config.queries[opt].fields;
            _.forEach(inputConfig, (value, key) => {
              BDA_REEX.fields[key].attr('disabled', !value);
            })

          }
        }


        var defaults = {};
        // Reference to BDA_STORAGE
        var BDA_STORAGE, BDA_REPOSITORY;

        $.fn.initRepositoryExplorer = function(pBDA, options) {
          console.log('Init plugin {0}'.format('repoExplorer'));

          BDA = pBDA;
          BDA_STORAGE = $.fn.bdaStorage.getBdaStorage();
          BDA_REPOSITORY = $.fn.getBdaRepository();
          BDA_DASH = $.fn.getDash();
          BDA_REEX.build();
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