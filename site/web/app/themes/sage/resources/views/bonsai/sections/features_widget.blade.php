@props([
    'class' => ''
])

@php
$featuresWidgetData = [
    'globalStyles' => [
        'containerClasses' => 'bg-white dark:bg-midnight-950 bg-opacity-30 dark:bg-opacity-10 shadow-lg rounded-xl',
        'contentClasses' => 'p-2',
        'descriptionClasses' => 'text-gray-600 dark:text-gray-400 text-sm',
        'noteClasses' => 'text-gray-600 dark:text-gray-400 text-sm',
        'noteLabelClasses' => 'font-bold',
    ],
    'listItemStyles' => [
        'listItemClasses' => 'flex items-start py-2',
        'numberClasses' => 'flex-shrink-0 flex items-center justify-center text-white mr-4 bg-gray-600 dark:bg-gray-700 rounded-full w-8 h-8 text-sm',
        'contentClasses' => '',
        'titleClasses' => 'font-semibold dark:text-gray-200',
        'textClasses' => 'text-sm text-gray-500 dark:text-gray-400',
    ],
    'ctaStyles' => [
        'containerClasses' => 'cta bg-white dark:bg-midnight-950 bg-opacity-50 dark:bg-opacity-10 rounded-lg flex items-center space-x-8 mt-2',
        'imageClasses' => 'w-44 h-44 object-cover rounded-xl',
        'contentContainerClasses' => 'flex items-center justify-between flex-1',
        'titleClasses' => 'text-xl font-semibold text-gray-900 dark:text-gray-100',
        'buttonClasses' => 'inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-midnight-950 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-opacity-10',
        'buttonIconClasses' => 'w-4 h-4 ml-2',
    ],
    'items' => [
        [
            'id' => 'widget-1',
            'title' => 'Challenge Types',
            'icon' => 'heroicon-o-flag',
            'content' => '',
            'cta' => [
                'title' => 'Challenge Types',
                'link' => '/challenges',
                'imagePath' => 'https://bonsai.so/dist/images/template-system_v01.adb3a1.png',
                'buttonText' => 'Learn more',
            ],
            'description' => 'Choose from various challenge types to match your goals:',
            'listItems' => [
                [
                    'number' => '1',
                    'itemName' => 'Daily Habit',
                    'text' => 'Build consistency with daily tasks',
                ],
                [
                    'number' => '2',
                    'itemName' => 'Content Creation',
                    'text' => 'Track your content creation journey',
                ],
                [
                    'number' => '3',
                    'itemName' => 'Custom Challenges',
                    'text' => 'Create your own challenge format',
                ],
            ],
        ],
        [
            'id' => 'widget-2',
            'title' => 'Accountability',
            'icon' => 'heroicon-o-user-group',
            'content' => '',
            'cta' => [
                'title' => 'Accountability Partners',
                'link' => '/accountability',
                'imagePath' => 'https://bonsai.so/dist/images/component-generation_v01.92fb24.png',
                'buttonText' => 'Learn more',
            ],
            'description' => 'Stay on track with accountability features:',
            'listItems' => [
                [
                    'number' => '1',
                    'itemName' => 'Partner Matching',
                    'text' => 'Find the perfect accountability partner',
                ],
                [
                    'number' => '2',
                    'itemName' => 'Progress Sharing',
                    'text' => 'Share your journey with your partners',
                ],
                [
                    'number' => '3',
                    'itemName' => 'Notifications',
                    'text' => 'Get reminders and encouragement',
                ],
                [
                    'number' => '4',
                    'itemName' => 'Mentor Mode',
                    'text' => 'Get guidance from experienced mentors',
                ],
            ],
        ],
        [
            'id' => 'widget-3',
            'title' => 'Stakes',
            'icon' => 'heroicon-o-banknotes',
            'content' => '',
            'cta' => [
                'title' => 'Challenge Stakes',
                'link' => '/stakes',
                'imagePath' => 'https://bonsai.so/dist/images/section-builder_v01.143d17.png',
                'buttonText' => 'Learn more',
            ],
            'description' => 'Add stakes to your challenges for extra motivation:',
            'listItems' => [
                [
                    'number' => '1',
                    'itemName' => 'Financial Stakes',
                    'text' => 'Put money on the line to ensure completion',
                ],
                [
                    'number' => '2',
                    'itemName' => 'Social Stakes',
                    'text' => 'Make public commitments for accountability',
                ],
                [
                    'number' => '3',
                    'itemName' => 'Reward System',
                    'text' => 'Earn rewards for completing challenges',
                ],
            ],
        ],
        [
            'id' => 'widget-4',
            'title' => 'Content Groups',
            'icon' => 'heroicon-o-document-text',
            'content' => '',
            'cta' => [
                'title' => 'Content Groups',
                'link' => '/groups',
                'imagePath' => 'https://bonsai.so/dist/images/documentation_v01.dfc82e.png',
                'buttonText' => 'Learn more',
            ],
            'description' => 'Streamline your content creation process:',
            'listItems' => [
                [
                    'number' => '1',
                    'itemName' => 'Automatic Publishing',
                    'text' => 'Auto-post completed challenge content',
                ],
                [
                    'number' => '2',
                    'itemName' => 'Group Feeds',
                    'text' => 'Share with like-minded challenge participants',
                ],
                [
                    'number' => '3',
                    'itemName' => 'Content Calendar',
                    'text' => 'Plan and schedule your content creation',
                ],
                [
                    'number' => '4',
                    'itemName' => 'Analytics',
                    'text' => 'Track engagement and growth metrics',
                ],
            ],
        ],
    ],
];
@endphp

<div class="{{ $class }}">
    <x-bonsai::widget :data="$featuresWidgetData" />
</div>