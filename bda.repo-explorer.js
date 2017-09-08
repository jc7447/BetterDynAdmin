// Extension for DASH
try {
  jQuery(document).ready(function() {
      (function($) {
          try {

            var BDA_REEX = {

              templates: {
                rql: {

                },
                menuPill: '<li role="presentation"><a id="repoExplorerButton"  href="#repo-explorer-tab" aria-controls="editor" role="tab" data-toggle="tab" data-cols="1" data-fs-mode="true">Repo Explorer</a></li>',
                panel: '<div role="tabpanel" class="tab-pane fade bottom-panel" id="repo-explorer-tab">' +
                  '<form id="dashEditorForm" class="form-horizontal">' +
                  '<div class="form-group top-row">' +
                  '<div class="col-sm-3">' +
                  '<select id="reexQueryType" class="form-control">' +
                  '<option data-queryable="false">print</option>' +
                  '<option data-queryable="true">query</option>' +
                  '<option data-queryable="true">add</option>' +
                  '<option data-queryable="false">remove</option>' +
                  '<option data-queryable="true">custom</option>' +
                  '</select>' +
                  '</div>' +
                  '<div class="col-sm-5">' +
                  '<input type-"text" id="reexRepo" class="form-control">' +
                  '</input>' +
                  '</div>' +
                  '<div class="col-sm-4">' +
                  '<div class="btn-group" role="group" >' +
                  '<button type="button" id="reexClear" class="btn btn-primary" title="clear">' +
                  '<i class="fa fa-eraser" />&nbsp;' +
                  '</i>' +
                  '</button>' +
                  '<button type="button" id="reexRun" class="btn btn-primary" title="run">' +
                  '<i class="fa fa-play" />&nbsp;' +
                  '</i>' +
                  '</button>' +
                  '</div>' +
                  '</div>' +
                  '</div>' +
                  '<div class="form-group middle-row">' +
                  '<div class="col-sm-6">' +
                  '<textarea id="reexEditor" class="form-control dash-input main-input reex-autocomplete" rows="4" placeholder=""></textarea>' +
                  '</div>' +
                  '<div class="col-sm-6">' +
                  '<div>preview</div>' +
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
                  BDA_REEX.$querySelect = BDA_REEX.$panel.find('#reexQueryType');
                  BDA_REEX.$editor = BDA_REEX.$panel.find('#reexEditor');
                  BDA_DASH.bindTabChangeResize(navPill.find('a[data-toggle="tab"]'));
                  BDA_REEX.initQueryTypeSelect();
                })
              },

              initQueryTypeSelect: function() {
                BDA_REEX.$querySelect.on('change', BDA_REEX.updateEditorState);
                BDA_REEX.updateEditorState(BDA_REEX.$querySelect); //init
              },
              updateEditorState: function() {
                let $option = $(this).find(':selected');
                let writable = $option.attr('data-queryable');
                console.log('writable %s', writable);
                if (writable === 'true') {
                  BDA_REEX.$editor.attr('disabled', false);
                } else {
                  BDA_REEX.$editor.attr('disabled', true);
                }
              }
            }
          };

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