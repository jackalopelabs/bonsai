@extends('layouts.app')

@section('content')
  <x-bonsai::sections.site_header />
  
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Interactive Games</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">Enhance your wellness journey with our collection of mindfulness and focus-building games.</p>
      </div>
    </div>
  </div>
  
  <x-bonsai::sections.games_section />
  
  <div class="container mx-auto px-4 py-16">
    <div class="max-w-7xl mx-auto">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl md:text-3xl font-bold mb-4">Benefits of Mindfulness Games</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div class="flex flex-col items-start">
            <div class="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Reduced Stress</h3>
            <p class="text-gray-600 dark:text-gray-300">Regular gameplay can help lower cortisol levels and reduce overall stress and anxiety.</p>
          </div>
          
          <div class="flex flex-col items-start">
            <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Improved Focus</h3>
            <p class="text-gray-600 dark:text-gray-300">Enhance your ability to concentrate and maintain attention on tasks for longer periods.</p>
          </div>
          
          <div class="flex flex-col items-start">
            <div class="bg-teal-100 dark:bg-teal-900 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Emotional Regulation</h3>
            <p class="text-gray-600 dark:text-gray-300">Develop better awareness and control of your emotional responses in challenging situations.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
@endsection 