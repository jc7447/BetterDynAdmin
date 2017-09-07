// Extension for DASH
try {
  jQuery(document).ready(function() {
    (function($) {
      try {

        var BDA_REEX = {

          templates: {
            menuPill: '<li role="presentation"><a id="repoExplorerButton"  href="#repo-explorer-tab" aria-controls="editor" role="tab" data-toggle="tab" data-cols="1" data-fs-mode="true">Repo Explorer</a></li>',
            panel: '<div role="tabpanel" class="tab-pane fade" id="repo-explorer-tab">Repo Explorer</div>',
          },

          build: function() {
            $('body').on('bda.dash.build.done', () => {
              console.log('init Repo Explorer')
              let navPill = $(BDA_REEX.templates.menuPill);
              BDA_DASH.$footer.find('#dashNav').append(navPill);
              BDA_DASH.$control.append($(BDA_REEX.templates.panel));
              BDA_DASH.bindTabChangeResize(navPill.find('a[data-toggle="tab"]'));
            })
          },
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