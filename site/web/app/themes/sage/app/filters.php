<?php

/**
 * Theme filters.
 */

namespace App;

/**
 * Add "… Continued" to the excerpt.
 *
 * @return string
 */
add_filter('excerpt_more', function () {
    return sprintf(' &hellip; <a href="%s">%s</a>', get_permalink(), __('Continued', 'sage'));
});

/**
 * Add sage_asset() function to Blade templates
 */
add_filter('acorn/template/url', function ($defaults) {
    return array_merge($defaults, [
        'asset' => function ($path) {
            return sage_asset($path);
        },
    ]);
});
