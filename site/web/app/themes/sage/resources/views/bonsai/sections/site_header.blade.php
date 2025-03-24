@props([
    'class' => ''
])

@php
$siteHeaderData = [
    'siteName' => 'Bonsai Games',
    'iconSvg' => '
        <svg class="h-8 w-8 mr-3" viewBox="0 0 731 731.2" fill="currentColor">
            <path d="M647.1 172.7L396 27.7a56.727 56.727 0 0 0-56.9 0l-251 144.9c-17.6 10.2-28.4 28.9-28.4 49.3v289.9c0 20.3 10.8 39.1 28.4 49.3l251 144.9c17.6 10.2 39.3 10.2 56.9 0l251-144.9c17.6-10.2 28.4-28.9 28.4-49.3V222c.1-20.4-10.7-39.2-28.3-49.3zM542.6 447.1c-14.9 16.8-41.5 14.9-52.4 4.3-4.9 2.8-17.9 9.7-31.2 8.3l-96.7 55.5c-1.3.8-2.9 1.2-4.4 1.2h-48.6c-2.5 0-3.4-3.3-1.2-4.6l107.7-62.7c9.7-5.7 9.7-19.7 0-25.4l-41-23.9-32.1-4.7s-98.3 28.5-133.9 12.2c-35.5-16.3-45 0-45 0s-15 13-37.5 3.1c-11.4-15.9 0-25.6 15.2-20.4-1.8-10.1 7.4-13 14.9-20.5-9.1-1.4-7.5-14.2-10.3-22.9-10.4-12.5-1.4-29.1 10.3-29.1-5.7-29.8 11.9-31.6 30-27.7 2.2-28.4 22.6-42.9 52.6-29.9-4.2-41.7 47.8-26 47.8-26s-16-15.5-2.8-26c13.1-10.5 18 0 18 0 16.6-19.5 49.5-4.7 51.2 8.7 1.3-4.6 20.6-4.2 20.6-4.2 36.5-28.2 79.4-4.5 75.3 17.2 63.3-24.8 54.8 56.4 54.8 56.4 14.8-13.5 13.8.6 27.8 8.7 34.9 10.4 19.4 23.5 19.4 23.5 37.7-7.1 59.3 19.9 44 41.1 18.4 11.9 17.9 25 10.5 33.6 6.6 7.2 7.9 19.3-2.8 32.5 4 29.4-28.1 33.4-60.2 21.7z"></path>
        </svg>
    ',
    'navLinks' => [
        [
            'url' => '/dashboard',
            'label' => 'Dashboard',
        ],
        [
            'url' => '/challenges',
            'label' => 'Challenges',
        ],
        [
            'url' => '/groups',
            'label' => 'Groups',
        ],
        [
            'url' => '/games',
            'label' => 'Games',
        ],
    ],
    'primaryLink' => '/new-challenge',
    'containerClasses' => 'px-6 flex justify-between items-center w-full',
    'headerClass' => 'max-w-7xl mx-auto sticky top-0 bg-white/10 dark:bg-midnight-950/20 backdrop-blur-md shadow-lg border border-slate-700/50 rounded-full mx-auto p-1 my-4',
    'buttonText' => 'Lobbies',
    'buttonPrefix' => 'Join',
    'showDarkModeToggle' => true,
    'darkModeToggleClass' => 'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200',
    'chevronSvg' => '<svg class="w-4 h-4 ml-2 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon"><path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd"></path></svg>',
];
@endphp

<div class="{{ $class }}">
    <x-bonsai::chosen.header :data="$siteHeaderData" />
</div>