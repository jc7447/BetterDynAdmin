(function($) {
  "use strict";
  var BDA_SEARCH = {

    $searchField: null,
    searchUrl: '/dyn/admin/atg/dynamo/admin/en/cmpn-search.jhtml?query=%QUERY',
    templates: {},

    defaultOptions: {
      align: 'left'
    },

    build: function($searchField, options) {
      console.time("bdaSearch");
      try {
        BDA_SEARCH.$searchField = $searchField;
        //wrap the field in twbs class for the bootstrap css to work
        var $wrapper = BDA_SEARCH.$searchField.wrap('<span class="twbs searchWrapper" ></span>').parent();

        //init bloodhound
        BDA_SEARCH.suggestionEngine = new Bloodhound({
          initialize: true,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          datumTokenizer: function(datum) {
            return Bloodhound.tokenizers.whitespace(datum.value);
          },
          identify: function(obj) {
            return obj.value;
          },
          remote: {
            url: BDA_SEARCH.searchUrl,
            wildcard: '%QUERY',
            //custom transport as search respones is not JSON
            transport: function(settings, onSuccess, onError) {
              //change the type to post, and let jquery assert the return type (instead of defaut JSON)
              $.ajax({
                url: settings.url,
                type: 'POST'
              }).done(done).fail(fail);

              function done(data, textStatus, request) {
                onSuccess(data);
              }

              function fail(request, textStatus, errorThrown) {
                onError(errorThrown);
              }
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

        });


        //init typeahead
        BDA_SEARCH.$searchField.typeahead({
          highlight: true,
          hint: false,
          minLength: 3,
        }, {
          name: 'bdaSearch',
          source: BDA_SEARCH.suggestionEngine,
          displayKey: 'value',
          limit: 15,
        });

        //go to page on select
        BDA_SEARCH.$searchField.bind('typeahead:select', function(ev, suggestion) {
          window.location = '/dyn/admin/nucleus' + suggestion.value;
        });
        logTrace(JSON.stringify(options));
        if (options.align == 'right') {
          logTrace('setup right alignment');
          var $menu = $wrapper.find('.tt-menu');
          //adjust the offset
          BDA_SEARCH.$searchField.bind('typeahead:render ', function(ev) {
            logTrace('open');
            var $field = $(this);
            //reset
            $menu.css('left','0');
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
  // Reference to BDA
  // Jquery plugin creation
  $.fn.bdaSearch = function(options) {
    console.log('Init plugin {0}'.format('bdaSearch'));
    BDA_SEARCH.build($(this), $.extend({}, BDA_SEARCH.defaultOptions, options));
    return this;
  };

})(jQuery);
