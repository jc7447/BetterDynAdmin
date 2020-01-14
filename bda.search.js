(function($) {
  "use strict";
  var BDA_SEARCH = {

    $searchField: null,
    searchUrl: '/dyn/admin/atg/dynamo/admin/en/cmpn-search.jhtml?query=%QUERY',
    templates: {},

    defaultOptions: {
      align: 'left',
      limit: 15,
      //must do a callback here since at init, BDA_search is not defined yet
      onEnter: (ev, suggestion) => BDA_SEARCH.onEnter(ev, suggestion)
    },

    onEnter: function(ev, suggestion) {
      window.location = '/dyn/admin/nucleus' + suggestion.value;
    },

    build: function($searchField, options) {
      try {
        BDA_SEARCH.$searchField = $searchField;
        //wrap the field in twbs class for the bootstrap css to work
        var $wrapper = BDA_SEARCH.$searchField.wrap('<span class="twbs searchWrapper" ></span>').parent();

        //init bloodhound

        let favs = [];
        var comps = BDA_STORAGE.getStoredComponents();
        _.forEach(comps, (fav) => {
          favs.push({
            value: fav.componentPath.replace(/\/dyn\/admin\/nucleus/g, '').replace(/\/$/g, '')
          });
        })

        BDA_SEARCH.suggestionEngineOptions = {
          initialize: true,
          local: favs,
          queryTokenizer: (query) => query.split('/'),
          datumTokenizer: (datum) => datum.value.split('/'),
          identify: function(obj) {
            return obj.value;
          },
          remote: {
            url: BDA_SEARCH.searchUrl,
            wildcard: '%QUERY',
            prepare: function(query, settings) {
              return {
                url: settings.url.replace('%QUERY', query),
                type: 'POST'
              };
            },
            //transform the returned html to extract the search results:
            transform: function(response) {
              var searchResultsTable = $('<div></div>').html(response).find('th:contains("Search Results:")').closest('table');
              var res = searchResultsTable
                .find('td > a')
                .map(function() {
                  return {
                    value: $(this).attr('href').replace(/\/dyn\/admin\/nucleus\/?/, '') //remove the beginning
                  };
                }).get();
              return res;
            }
          }

        };
        BDA_SEARCH.suggestionEngine = new Bloodhound(BDA_SEARCH.suggestionEngineOptions);


        //init typeahead
        BDA_SEARCH.$searchField.typeahead({
          highlight: true,
          hint: false,
          minLength: 3,
        }, {
          name: 'bdaSearch',
          source: BDA_SEARCH.suggestionEngine,
          displayKey: 'value',
          limit: options.limit,
        });

        //go to page on select
        BDA_SEARCH.$searchField.bind('typeahead:select', options.onEnter);
        logTrace(JSON.stringify(options));
        if (options.align == 'right') {
          logTrace('setup right alignment');
          var $menu = $wrapper.find('.tt-menu');
          //adjust the offset
          BDA_SEARCH.$searchField.bind('typeahead:render ', function(ev) {
            logTrace('open');
            var $field = $(this);
            //reset
            $menu.css('left', '0');
            //adjust to flush right
            var menuWidth = $menu.width();
            var inputWidth = $field.width();
            //add a small offset
            $menu.css('left', (inputWidth - menuWidth + 10) + 'px');
          });
        }

        //adjust style
        $wrapper
          .find('.twitter-typeahead')
          .css('display', 'inherit');
        BDA_SEARCH.$searchField.css('vertical-align', 'baseline');

        console.timeEnd("bdaSearch");
      } catch (e) {
        console.error(e);
      }
    },
  };

  var BDA_STORAGE;
  // Reference to BDA
  // Jquery plugin creation

  $.fn.bdaSearch = function(options) {
    console.log('Init plugin {0}'.format('bdaSearch'));
    BDA_STORAGE = $.fn.bdaStorage.getBdaStorage();
    BDA_SEARCH.build($(this), $.extend({}, BDA_SEARCH.defaultOptions, options));
    return this;
  };

  $.fn.getBdaSearchSuggestionEngineOptions = () => BDA_SEARCH.suggestionEngineOptions;

})(jQuery);