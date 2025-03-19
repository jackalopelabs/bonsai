@props([
    'class' => ''
])

@php
$homeHeroData = [
    'title' => 'Challenge Yourself',
    'subtitle' => 'Track your progress, maintain streaks, achieve your goals',
    'description' => 'A challenge tracking platform with accountability partners, stakes, and gamification to help you build better habits',
    'buttonText' => 'Start Challenge',
    'buttonLink' => '/new-challenge',
    'secondaryText' => 'Learn More',
    'secondaryLink' => '/how-it-works',
    'buttonLinkIcon' => true,
    'secondaryIcon' => true,
    'containerClasses' => 'container mx-auto px-4 mb-12 mt-0 md:mt-24',
    'columnClasses' => 'flex flex-col md:flex-row items-center md:items-start -mx-4',
    'imageColumnClasses' => 'w-full md:w-1/2 px-4 flex justify-center items-center mt-12 md:mt-0 md:order-last',
    'textColumnClasses' => 'w-full md:w-1/2 px-4',
    'titleClass' => 'font-semibold text-6xl',
    'productTagClasses' => 'bg-white bg-opacity-50 px-3 py-1 text-sm inline-block',
    'productIconClasses' => 'w-4 h-4 ml-2 inline-block align-middle',
    'buttonClasses' => 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xl py-2 px-5 rounded-full',
    'buttonIconClasses' => 'text-white w-6 h-6 ml-2 inline-block align-middle',
    'secondaryClasses' => 'text-sm bg-transparent px-2 py-1 backdrop-blur-md shadow-lg rounded-md border border-gray-100',
    'secondaryIconClasses' => 'w-4 h-4 ml-2 inline-block align-middle',
    'iconMappings' => [
        'dropdownIcon' => 'heroicon-s-chevron-down',
        'buttonLinkIcon' => 'heroicon-s-play',
        'secondaryIcon' => 'heroicon-s-arrow-right',
    ],
];
@endphp

<div class="{{ $class }}">
    <x-bonsai::chosen.hero :data="$homeHeroData" />
</div>