@props([
    'class' => ''
])

@php
$siteHeaderData = [
    'siteName' => 'Chōsen',
    'iconSvg' => '<svg class="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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
    ],
    'primaryLink' => '/new-challenge',
    'containerClasses' => 'px-6 flex justify-between items-center w-full',
    'headerClass' => 'max-w-7xl mx-auto sticky top-0 bg-white/10 dark:bg-midnight-950/20 backdrop-blur-md shadow-lg border border-slate-700/50 rounded-full mx-auto p-1 my-4',
    'buttonText' => 'New Challenge',
    'buttonPrefix' => 'Start',
    'showDarkModeToggle' => true,
    'darkModeToggleClass' => 'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200',
    'chevronSvg' => '<svg class="w-4 h-4 ml-2 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon"><path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd"></path></svg>',
];
@endphp

<div class="{{ $class }}">
    <x-bonsai::chosen.header :data="$siteHeaderData" />
</div>