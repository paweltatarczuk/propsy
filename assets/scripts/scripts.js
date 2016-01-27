(function($) {
    'use strict';

    var mapElement = document.getElementById('map');
    var map = new Map(mapElement);

    $('html').on('change', 'input[name="q"]', function() {
        map.search($(this).val());
    });
})(jQuery);
