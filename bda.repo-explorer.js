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
                requireId: true,
                template: 'print {0} {1} {2}'
              },
              query: {
                writable: true,
                requireId: false
              },
              add: {
                writable: true,
                requireId: true
              },
              remove: {
                writable: false,
                requireId: true
              },
              custom: {
                writable: true,
                requireId: false
              }
            }
          },

          templates: {

            menuPill: '<li role="presentation"><a id="repoExplorerButton"  href="#repo-explorer-tab" aria-controls="editor" role="tab" data-toggle="tab" data-cols="1" data-fs-mode="true">Repo Explorer</a></li>',
            panel: '<div role="tabpanel" class="tab-pane fade bottom-panel" id="repo-explorer-tab">' +
              '<form id="dashEditorForm" class="form-horizontal">' +
              '<div class="form-group top-row">' +
              '<div class="col-sm-2">' +
              '<select id="reexQueryType" class="form-control">' +
              '<option data-queryable="false">print</option>' +
              '<option data-queryable="true">query</option>' +
              '<option data-queryable="true">add</option>' +
              '<option data-queryable="false">remove</option>' +
              '<option data-queryable="true">custom</option>' +
              '</select>' +
              '</div>' +
              '<div class="col-sm-4">' +
              '<input type="text" id="reexRepo" class="form-control" placeholder="repository">' +
              '</input>' +
              '</div>' +
              '<div class="col-sm-2">' +
              '<input type="text" id="reexItemDesc" class="form-control" placeholder="item descriptor">' +
              '</input>' +
              '</div>' +
              '<div class="col-sm-2">' +
              '<input type="text" id="reexId" class="form-control" placeholder="id">' +
              '</input>' +
              '</div>' +
              '<div class="col-sm-2">' +
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
              BDA_REEX.$idInput = BDA_REEX.$panel.find('#reexId');
              BDA_REEX.$itemDescInput = BDA_REEX.$panel.find('#reexItemDesc');
              BDA_REEX.$repoInput = BDA_REEX.$panel.find('#reexRepo');
              BDA_DASH.bindTabChangeResize(navPill.find('a[data-toggle="tab"]'));
              BDA_REEX.initQueryTypeSelect();

              var defaultTab = BDA_STORAGE.getConfigurationValue('dashDefaultTab');
              if (!isNull(defaultTab)) {
                $('#' + defaultTab).tab('show');
              }

              BDA_REEX.$submit = BDA_REEX.$panel.find('#reexRun');
              BDA_REEX.$submit.on('click', BDA_REEX.submit)

            })
          },

          submit: function() {

            try {

              console.log('submit')
              let queryType = BDA_REEX.$querySelect.val();
              console.log(queryType);
              switch (queryType) {
                case 'print':
                  BDA_REEX.submitPrint();
                  break;
                default:

              }
            } catch (e) {
              console.error(e);
            }
          },

          submitPrint: function() {
            let dashQuery = BDA_REEX.config.queries.print.template.format(BDA_REEX.getRepoInput(), BDA_REEX.getItemDescInput(), BDA_REEX.getIdInput());
            BDA_DASH.handleInput(dashQuery);
          },

          getIdInput: function() {
            return BDA_REEX.$idInput.val();
          },

          getItemDescInput: function() {
            return BDA_REEX.$itemDescInput.val();
          },
          getRepoInput: function() {
            return BDA_REEX.$repoInput.val();
          },

          initQueryTypeSelect: function() {
            BDA_REEX.$querySelect.on('change', BDA_REEX.updateEditorState);
            BDA_REEX.updateEditorState(); //init
          },
          updateEditorState: function() {
            let $option = BDA_REEX.$querySelect.find(':selected');
            let opt = $option.val();
            let writable = true;
            try {
              writable = BDA_REEX.config.queries[opt].writable;
            } catch (e) {

            }
            console.log('writable %s', writable);
            BDA_REEX.$editor.attr('disabled', !writable);
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