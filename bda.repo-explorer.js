// Extension for DASH
try {
  jQuery(document).ready(function() {
    (function($) {
      try {

        var BDA_REEX = {

          config: {
            queries: {
              print: {
                template: 'print {repository} {itemDescriptor} {id}',
                fields: {
                  id: true,
                  repository: true,
                  itemDescriptor: true,
                  text: false
                }
              },
              query: {
                template: 'query {repository} {itemDescriptor} {{text}}',
                fields: {
                  id: false,
                  repository: true,
                  itemDescriptor: true,
                  text: true
                }
              },
              add: {
                fields: {
                  id: true,
                  repository: true,
                  itemDescriptor: true,
                  text: false
                }
              },
              remove: {
                template: 'rql {repository} {<remove-item item-descriptor="{itemDescriptor}" id="{id}"/>}',
                fields: {
                  id: true,
                  repository: true,
                  itemDescriptor: true,
                  text: false
                }
              },
              freeRql: {
                template: 'rql {repository} {{text}}',
                fields: {
                  id: false,
                  repository: true,
                  itemDescriptor: true,
                  text: true
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
              '<div class="input-group">' +
              '<input type="text" id="reexRepo" class="form-control reex-input" placeholder="repository"/>' +
              '<div class="input-group-btn">' +
              '<button type="button"  class="btn btn-default current-component-button" data-target="repository">' +
              '<i class="fa fa-location-arrow" ></i>&nbsp;' +
              '</button>' +
              '<button type="button"  class="btn btn-default clear-button" data-target="repository">×</button>' +
              '</div>' +
              '</div>' +
              '</div>' +
              '<div class="col-sm-2">' +
              '<select  id="reexItemDesc" class=" reex-input" placeholder="item descriptor">' +
              '</select>' +
              '</div>' +
              '<div class="col-sm-2">' +
              '<div class="input-group">' +
              '<input type="text" id="reexId" class="form-control reex-input" placeholder="id"/>' +
              '<div class="input-group-btn">' +
              '<button type="button"  class="btn btn-default clear-button" data-target="id">×</button>' +
              '</div>' +
              '</div>' +
              '</div>' +
              '<div class="col-sm-2">' +
              '<div class="btn-group" role="group" >' +
              '<button type="button" id="reexClear" class="btn btn-primary clear-all" title="clear">' +
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
              '<textarea id="reexEditor" class="form-control dash-input main-input reex-input reex-autocomplete" rows="5" placeholder=""></textarea>' +
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


              var autosaveFc = debounce(BDA_REEX.savePanelStatus,
                300);

              // bind preview
              BDA_REEX.$panel.find('.reex-input')
                .on('keyup', BDA_REEX.updatePreview)
                .on('change', BDA_REEX.updatePreview)
                .on('keyup', autosaveFc)
                .on('change', autosaveFc)

              BDA_REEX.initQueryTypeSelect();
              BDA_REEX.updatePreview(); // init on build

              BDA_REEX.reloadRepositoryDefinition();
              BDA_REEX.initFields();
            })
          },

          initFields: function() {
            BDA_REEX.initItemDescriptorField();
            BDA_REEX.initRepositoryField();

            $('.clear-button').on('click', function(event) {
              let target = $(this).attr('data-target');
              BDA_REEX.fields[target].val('').change();
            });

            $('.clear-all').on('click', () => {
              _.forEach(BDA_REEX.fields, (f) => {
                f.val('').change();
              })
            })

            $('.current-component-button').on('click', function() {
              console.log('current-component-button')
              let target = $(this).attr('data-target');
              BDA_REEX.fields[target].val(getCurrentComponentPath()).change();
            })

            //bind enter on text & id inputs
            _.forEach([BDA_REEX.fields.id, BDA_REEX.fields.text], (field) => {
              field.on('keydown', (e) => {


                if (e.which == 13 && !e.altKey && !e.shiftKey) {
                  e.preventDefault();
                  BDA_REEX.submit();
                  return false;
                }
              })
            })

          },

          initItemDescriptorField: function() {
            BDA_REEX.fields.itemDescriptor.select2({
              placeholder: "Select a descriptor",
              allowClear: true,
              width: "100%",
              matcher: function(params, data) {
                // If there are no search terms, return all of the data
                if ($.trim(params) === '') {
                  return data;
                }
                data = data.toUpperCase();
                params = params.toUpperCase();
                // `params.term` should be the term that is used for searching
                // `data.text` is the text that is displayed for the data object
                if (data.indexOf(params) != -1)
                  return true;
                return false;
              }
            });
          },

          initRepositoryField: function() {

            //autocomplete
            let settings = $().getBdaSearchSuggestionEngineOptions();
            let dynamoSearch = new Bloodhound(settings);



            //init typeahead
            BDA_REEX.fields.repository.typeahead({
              highlight: true,
              hint: false,
              minLength: 3,
            }, [{
              name: 'reexRepositorySearch',
              source: dynamoSearch,
              displayKey: 'value',
              limit: 5,
              // }, {
              //   name: 'favs',
              //   source: favSearchEngine,
              //   //   displayKey: 'path',
              //   limit: 5
            }]);


            BDA_REEX.fields.repository
              .on('typeahead:select', BDA_REEX.reloadRepositoryDefinition)
              .on('change', BDA_REEX.reloadRepositoryDefinition);


          },
          savePanelStatus: function() {
            try {

              var inputs = BDA_REEX.getInputs()
              let inputAsString = JSON.stringify(inputs);
              BDA_STORAGE.storeConfiguration('reexCurrentInputs', inputAsString);
            } catch (e) {
              console.error(e);
            }
          },

          reloadRepositoryDefinition: function() {
            processRepositoryXmlDef('definitionFiles', ($xmlDef) => {
              try {

                if (!_.isNil($xmlDef) && $xmlDef.length > 0) {

                  let itemDescriptors = [];
                  var $descriptors = $xmlDef.find("item-descriptor");
                  $descriptors.each((index, desc) => {
                    itemDescriptors.push(desc.getAttribute('name'));
                  })
                  itemDescriptors = sort(itemDescriptors);
                  // update select box
                  BDA_REEX.fields.itemDescriptor
                    .find('option')
                    .remove();

                  _.forEach(itemDescriptors, (desc) => {
                      BDA_REEX.fields.itemDescriptor.append($('<option>{0}</option>'.format(desc)));
                    })
                    //set default value

                  var defaultDesc = BDA_REPOSITORY.defaultDescriptor[getComponentNameFromPath('/dyn/admin/nucleus' + BDA_REEX.fields.repository.val())];
                  BDA_REEX.fields.itemDescriptor.val(defaultDesc);
                  BDA_REEX.fields.itemDescriptor.trigger('change');
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