<!doctype html>
<html @php(language_attributes()) x-data="globalData" class="relative h-screen">
    <!-- Hero Background Images -->
    <div class="absolute inset-0 z-0">
        <img src="{{ asset('resources/images/chosen_hero_03.webp') }}"
                alt="Background Light"
                class="w-full h-full object-cover object-top opacity-100"
                style="display: none;"
                x-bind:style="!darkMode ? 'display: block;' : 'display: none;'"
        />
        <img src="{{ asset('resources/images/chosen_hero_01.webp') }}" 
                alt="Background Dark" 
                class="w-full h-full object-cover object-top opacity-100"
                style="display: block;"
                x-bind:style="darkMode ? 'display: block;' : 'display: none;'"
        />
    </div>

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        @php(do_action('get_header'))
        @php(wp_head())
        @php(wp_enqueue_style('sage/app.css', asset('resources/css/app.css'), false, null))
        @php(wp_enqueue_script('sage/app.js', asset('resources/js/app.js'), ['jquery'], null, true))
        @include('bonsai.components.chosen.analytics')
    </head>
    
    <body @php(body_class('transition-colors duration-200 p-0 m-0 h-screen')) 
          x-bind:class="darkMode ? 'dark-mode' : 'light-mode'">
        <style>
            body.dark-mode {
                background-color: #060614 !important;
                color: white !important;
            }
            body.light-mode {
                background-color: white !important;
                color: #1e293b !important;
            }
        </style>
        @php(wp_body_open())
        <div id="app" class="relative z-10">
            <a class="sr-only focus:not-sr-only" href="#main">
                {{ __('Skip to content', 'radicle') }}
            </a>

            @includeIf('bonsai.sections.site_header')

            <main id="main" class="max-w-5xl mx-auto">
                <div class="{{ $containerInnerClasses ?? 'px-6' }}">
                    @yield('content')
                </div>
            </main>

            @includeIf('bonsai.chosen.sections.site_footer')
        </div>

        @php(do_action('get_footer'))
        @php(wp_footer())
    </body>
</html>