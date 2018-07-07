var _ = require('underscore');

(function($) {
    'use strict';

    var mapElement = document.getElementById('map');
    var map = new Map(mapElement);

    $('html').on('change', 'input[name="q"]', _.debounce(function() {
        var val = $(this).val();
        if (!val) return;
        map.search(val);
    }, 100));

    $('html').on('click', '.search-input .clear', function(e) {
        $(this).siblings('input[type="text"]').val('').trigger('change');
        e.preventDefault();
    });

    // Page navigation toggling functionality
    (function() {

        // Handle the nav click
        $('html').on('click', '#page-nav a.toggle', function(e) {
            var $nav = $(this).closest('#page-nav');
            $nav[$nav.hasClass('closed') ? 'removeClass' : 'addClass']('closed');

            e.preventDefault();
        });

        // Close nav at initialization
        $(document).ready(function() {

            var timer = setTimeout(function() {
                $('#page-nav').addClass('closed');
            }, 1000);

        });
    })();

    // Search suggestions
    (function() {

        var showSuggestions = function(places) {
            var addresses = {};

            _.each(places, function(place) {
                var matches = place.address.match(/(.*) [^,]*, \d+-\d+ ([^,]+), .*/);

                if (matches) {
                    var address = {
                        street: matches[1],
                        city: matches[2]
                    };

                    addresses[matches[1] + ' ' + matches[2]] = address;
                }
            });

            var source   = $("#suggestion-template").html();
            var template = Handlebars.compile(source);

            $('#page-nav .search-results').html(_.map(addresses, template))
        }

        var handler = function() {
            var keyword = $(this).val();

            if (keyword.length < 3) {
                showSuggestions([]);
                return;
            }

            $.ajax({
                url: 'places/suggest/' + keyword,
                success: function(data) {
                    showSuggestions(data);
                }
            });
        };

        // Handle request
        $('html').on('keypress keyup', '#page-nav input[name="q"]', _.debounce(handler, 200));

        // Handle suggestion selection
        $('html').on('click', '#page-nav .search-results .suggestion a', function(e) {
            $('#page-nav input[name="q"]')
                .val(
                    $(this).children('.street').text() + ', ' + $(this).children('.city').text()
                )
                .trigger('change');

            e.preventDefault();
        });

    })();

    // Search types filter
    (function() {
        // Handle filter change
        $('html').on('change', '#page-nav input[name="filter"]', function(e) {
            var filterTypes = false;
            var $filterTypes = $('#page-nav input[name="filter"]');
            if ($filterTypes.not(':checked').size() !== 0) {
                filterTypes = $filterTypes.filter(':checked').map(function() {
                    return this.value;
                }).get();
            }

            map.setFilterTypes(filterTypes);
        });

        // Trigger initial filter
        $(document).ready(function() {
            $('#page-nav input[name="filter"]:first').trigger('change');
        })
    })();

})(jQuery);
