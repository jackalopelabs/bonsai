@props([
    'class' => ''
])

@php
$headerData = [    'siteName' => 'Bonsai',
    'iconComponent' => 'heroicon-o-command-line',
    'navLinks' => [
        [
            'url' => '#features',
            'label' => 'Features',
        ],
        [
            'url' => '#commands',
            'label' => 'Commands',
        ],
        [
            'url' => '#docs',
            'label' => 'Documentation',
        ],
        [
            'url' => '/games',
            'label' => 'Games',
        ],
    ],
    'primaryLink' => 'https://github.com/jackalopelabs/bonsai-cli',
    'containerClasses' => 'max-w-5xl mx-auto',
    'containerInnerClasses' => 'px-6',
    'headerClass' => 'bg-indigo-500 bg-opacity-60 backdrop-blur-md shadow-lg border border-transparent rounded-full mx-auto p-1 my-4',
    'iconClasses' => 'h-8 w-8 mr-2 p-1',
    'chevronClasses' => 'w-4 h-4 ml-2 inline-block',
    'buttonText' => 'Plans',
    'buttonPrefix' => 'See',
];
@endphp

<div class="{{ $class }}">
    <x-bonsai::header :data="$headerData" />
</div>
