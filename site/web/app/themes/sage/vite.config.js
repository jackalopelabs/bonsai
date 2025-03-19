import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin'
import { wordpressPlugin, wordpressThemeJson } from '@roots/vite-plugin';

export default defineConfig({
  base: '/app/themes/sage/public/build/',
  plugins: [
    tailwindcss({
      config: {
        darkMode: 'class',
        content: [
          "./resources/**/*.blade.php",
          "./resources/**/*.js",
          "./resources/**/*.vue",
        ],
        theme: {
          extend: {
            colors: {
              'midnight-950': 'var(--color-midnight-950)',
            },
          },
        },
      },
    }),
    laravel({
      input: [
        'resources/css/app.css',
        'resources/js/app.js',
        'resources/css/editor.css',
        'resources/js/editor.js',
        'resources/scripts/tiny-planets-game.js',
        'resources/scripts/planets/planet.js',
        'resources/scripts/planets/presets.js',
        'resources/scripts/planets/materials/AtmosphereMaterial.js',
        'resources/scripts/planets/materials/OceanCausticsMaterial.js'
      ],
      refresh: true,
    }),

    wordpressPlugin(),

    // Generate the theme.json file in the public/build/assets directory
    // based on the Tailwind config and the theme.json file from base theme folder
    wordpressThemeJson({
      disableTailwindColors: false,
      disableTailwindFonts: false,
      disableTailwindFontSizes: false,
    }),
  ],
  resolve: {
    alias: {
      '@scripts': '/resources/js',
      '@styles': '/resources/css',
      '@fonts': '/resources/fonts',
      '@images': '/resources/images',
    },
  },
})
