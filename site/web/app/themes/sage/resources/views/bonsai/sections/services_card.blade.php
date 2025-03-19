@props([
    'class' => ''
])

@php
$servicesCardData = [
    'sectionId' => 'features',
    'sectionTitle' => 'Features',
    'navLinks' => [
        [
            'url' => '/how-it-works',
            'label' => 'How It Works',
        ],
        [
            'url' => '#pricing',
            'label' => 'Pricing',
        ],
    ],
    'sectionClasses' => 'py-12',
    'containerClasses' => 'max-w-4xl mx-auto px-6',
    'navContainerClasses' => 'flex flex-col sm:flex-row flex-wrap items-start mb-6 justify-center md:justify-center',
    'titleClasses' => 'text-lg text-gray-700 bg-white p-3 rounded-lg mr-4 mb-4 sm:mb-0',
    'titleIconClasses' => 'w-4 h-4 ml-2 inline-block align-middle',
    'navLinkClasses' => 'text-lg text-gray-700 p-3 mb-4 sm:mb-0 hidden sm:inline',
    'navLinkIconClasses' => 'w-4 h-4 ml-2 inline-block align-middle',
    'cardContainerClasses' => 'bg-white bg-opacity-50 grid md:grid-cols-2 gap-8 rounded-3xl p-3',
    'imageColumnClasses' => 'md:w-1/2 mx-auto',
    'featuresColumnClasses' => 'md:w-2/2 space-y-6',
    'featureItemClasses' => 'flex items-start space-x-4 bg-white rounded-xl p-3',
    'featureIconClasses' => 'h-6 w-6 text-indigo-500',
    'featureTitleClasses' => 'text-lg font-semibold',
    'featureDescriptionClasses' => 'text-sm text-gray-500',
    'featureItems' => [
        [
            'icon' => 'heroicon-o-check-badge',
            'title' => 'Challenge Tracking',
            'description' => 'Track daily progress with a kanban-style interface',
        ],
        [
            'icon' => 'heroicon-o-user-group',
            'title' => 'Accountability Partners',
            'description' => 'Assign partners to keep you on track with your goals',
        ],
        [
            'icon' => 'heroicon-o-chart-bar',
            'title' => 'Streak Visualization',
            'description' => 'GitHub-style activity tracking to gamify your progress',
        ],
    ],
];
@endphp

<div class="{{ $class }}">
    <x-bonsai::card :data="$servicesCardData" />
</div>