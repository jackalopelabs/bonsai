<!doctype html>
<html @php(language_attributes())>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @php(do_action('get_header'))
    @php(wp_head())

    @production
      <link rel="stylesheet" href="{{ asset('app/themes/sage/public/build/assets/app-BlU6k3Uc.css') }}">
      <script type="module" src="{{ asset('app/themes/sage/public/build/assets/app-B6ltmGRv.js') }}" defer></script>
    @else
      @vite(['resources/css/app.css', 'resources/js/app.js'])
    @endproduction
  </head>

  <body @php(body_class())>
    @php(wp_body_open())

    <div id="app">
      <a class="sr-only focus:not-sr-only" href="#main">
        {{ __('Skip to content', 'sage') }}
      </a>

      @include('sections.header')

      <main id="main" class="main">
        @yield('content')
      </main>

      @hasSection('sidebar')
        <aside class="sidebar">
          @yield('sidebar')
        </aside>
      @endif

      @include('sections.footer')
    </div>

    @php(do_action('get_footer'))
    @php(wp_footer())
  </body>
</html>
