@props([
    'class' => ''
])

@php
$pricingData = [
    'pricingBoxStyles' => [
        'containerClasses' => 'bg-white bg-opacity-50 rounded-xl shadow-lg overflow-hidden mx-auto md:mx-0 text-center my-3 transition-transform transform hover:scale-105',
        'iconClasses' => 'inline-block h-12 w-12 mt-8 mb-4',
        'planTypeClasses' => 'text-gray-400',
        'priceClasses' => 'text-4xl font-bold',
        'dividerClasses' => 'border-t border-gray-200 my-5',
        'featureListClasses' => 'my-4 text-left space-y-3',
        'featureItemClasses' => 'flex items-center justify-start text-gray-500',
        'featureIconClasses' => 'w-5 h-5 mr-2',
        'ctaButtonClasses' => 'inline-block py-2 px-6 rounded-full',
        'ctaIconClasses' => 'inline-block h-4 w-4 ml-2',
    ],
    'title' => 'Choose Your Plan',
    'subtitle' => 'Select the plan that best suits your challenge goals.',
    'description' => 'Limited-time pricing available now',
    'pricingBoxes' => [
        [
            'icon' => 'heroicon-o-flag',
            'iconColor' => 'text-purple-500',
            'planType' => 'Basic',
            'price' => 'Free',
            'features' => [
                '3 active challenges',
                'Basic streak tracking',
                'Public accountability',
                'Community support',
                'Basic analytics',
            ],
            'ctaLink' => '/signup',
            'ctaText' => 'Get Started',
            'ctaColor' => 'bg-white',
            'iconBtn' => 'heroicon-o-arrow-right',
            'iconBtnColor' => 'text-gray-500',
        ],
        [
            'icon' => 'heroicon-o-trophy',
            'iconColor' => 'text-indigo-600',
            'planType' => 'Challenger',
            'price' => '$9/mo',
            'features' => [
                'Unlimited challenges',
                'Advanced streak analytics',
                'Accountability partners',
                'Financial stakes',
                'Priority support',
            ],
            'ctaLink' => '#buy-challenger',
            'ctaText' => 'Upgrade',
            'ctaColor' => 'bg-gradient-to-r from-emerald-600 to-green-500 text-white',
            'iconBtn' => 'heroicon-o-arrow-down-on-square',
            'iconBtnColor' => 'text-white',
        ],
        [
            'icon' => 'heroicon-o-star',
            'iconColor' => 'text-blue-600',
            'planType' => 'Champion',
            'price' => '$19/mo',
            'features' => [
                'Everything in Challenger',
                'Content groups',
                'Auto-publishing',
                'API access',
                'White-label options',
            ],
            'ctaLink' => '#buy-champion',
            'ctaText' => 'Go Pro',
            'ctaColor' => 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
            'iconBtn' => 'heroicon-o-shopping-cart',
            'iconBtnColor' => 'text-white',
        ],
    ],
];
@endphp

<div class="{{ $class }}">
    <x-bonsai::pricing-box :data="$pricingData" />
</div>