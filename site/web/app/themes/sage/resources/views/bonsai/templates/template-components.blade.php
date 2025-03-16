{{--
    Template Name: Components Template
--}}
@extends('layouts.app')

@section('content')
    <div class="container mx-auto py-10 px-4">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold mb-4">Components Library</h1>
            <p class="text-xl text-gray-600 mb-12">Explore our collection of reusable Blade components for building beautiful web interfaces.</p>

            
        </div>
    </div>
@endsection

@php
function getExampleData($component) {
    switch ($component) {
        case 'hero':
            return 'title="Welcome to Components" subtitle="Explore our library" description="Build beautiful interfaces with our component library" buttonText="Get Started"';
        case 'faq':
            return ':faqs="[
                [\'question\' => \'What are components?\', \'answer\' => \'Reusable building blocks for web interfaces\'],
                [\'question\' => \'How do I use them?\', \'answer\' => \'Import them into your templates and pass the required props\']
            ]"';
        // Add more examples for other components
        default:
            return '';
    }
}
@endphp