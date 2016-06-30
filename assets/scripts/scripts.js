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
})(jQuery);
