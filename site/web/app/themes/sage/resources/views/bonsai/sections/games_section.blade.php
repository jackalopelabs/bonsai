@props([
    'class' => '',
    'title' => 'Featured Games',
    'subtitle' => 'Explore our collection of interactive games designed to enhance your wellness journey',
])

<section class="py-16 {{ $class }}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">{{ $title }}</h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{{ $subtitle }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Game Card 1 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
                <div class="h-48 bg-indigo-500 relative">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-center mb-3">
                        <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">Meditation</span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">5 min</span>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Mindfulness Journey</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">An interactive meditation game that guides you through beautiful landscapes while practicing mindfulness techniques.</p>
                    <a href="/games/mindfulness-journey" class="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                        Play Now
                        <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </a>
                </div>
            </div>

            <!-- Game Card 2 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
                <div class="h-48 bg-purple-500 relative">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-center mb-3">
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">Energy</span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">10 min</span>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Energy Flow</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">A rhythm-based game that helps you synchronize your movements with energizing music to boost your mood and vitality.</p>
                    <a href="/games/energy-flow" class="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                        Play Now
                        <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </a>
                </div>
            </div>

            <!-- Game Card 3 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
                <div class="h-48 bg-teal-500 relative">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-center mb-3">
                        <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">Focus</span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">15 min</span>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Mind Maze</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">Challenge your cognitive abilities with puzzles designed to improve focus, memory, and problem-solving skills.</p>
                    <a href="/games/mind-maze" class="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                        Play Now
                        <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>

        <div class="mt-12 text-center">
            <a href="/games/all" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                View All Games
                <svg class="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </a>
        </div>
    </div>
</section> 