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

})(jQuery);
