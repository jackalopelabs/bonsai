@php
    // Include the section file to get the data
    $dataPath = resource_path('views/bonsai/sections/kanban_board_data.php');
    $kanbanBoardData = [];
    
    if (file_exists($dataPath)) {
        $kanbanBoardData = include($dataPath);
    } else {
        // Fallback data if file doesn't exist
        $kanbanBoardData = [
            'sectionId' => 'kanban',
            'sectionTitle' => 'Daily Challenges',
            'darkModeSupport' => true,
            'columns' => [
                [
                    'id' => 'todo',
                    'title' => 'To Do',
                    'cards' => [
                        [
                            'id' => 'task-1',
                            'title' => 'Research competitors',
                            'description' => 'Analyze top 5 competitors in the market',
                            'labels' => ['feature'],
                            'dueDate' => '2023-12-15',
                            'assignee' => 'Alex'
                        ],
                        [
                            'id' => 'task-2',
                            'title' => 'Design homepage',
                            'description' => 'Create wireframes for the new homepage',
                            'labels' => ['design'],
                            'dueDate' => '2023-12-18',
                            'assignee' => 'Jordan'
                        ],
                        [
                            'id' => 'task-3',
                            'title' => 'Setup analytics',
                            'description' => 'Implement Google Analytics and set up custom events',
                            'labels' => ['improvement'],
                            'dueDate' => '2023-12-20',
                            'assignee' => 'Taylor'
                        ]
                    ]
                ],
                [
                    'id' => 'in-progress',
                    'title' => 'In Progress',
                    'cards' => [
                        [
                            'id' => 'task-4',
                            'title' => 'User authentication',
                            'description' => 'Implement login, registration and password reset',
                            'labels' => ['feature'],
                            'dueDate' => '2023-12-10',
                            'assignee' => 'Morgan'
                        ],
                        [
                            'id' => 'task-5',
                            'title' => 'API integration',
                            'description' => 'Connect to payment gateway API',
                            'labels' => ['feature', 'bug'],
                            'dueDate' => '2023-12-12',
                            'assignee' => 'Casey'
                        ]
                    ]
                ],
                [
                    'id' => 'review',
                    'title' => 'Review',
                    'cards' => [
                        [
                            'id' => 'task-6',
                            'title' => 'Mobile responsiveness',
                            'description' => 'Test and fix responsive design issues',
                            'labels' => ['bug'],
                            'dueDate' => '2023-12-08',
                            'assignee' => 'Riley'
                        ]
                    ]
                ],
                [
                    'id' => 'done',
                    'title' => 'Done',
                    'cards' => [
                        [
                            'id' => 'task-7',
                            'title' => 'Project setup',
                            'description' => 'Initialize repository and setup development environment',
                            'labels' => ['documentation'],
                            'dueDate' => '2023-12-01',
                            'assignee' => 'Jamie'
                        ],
                        [
                            'id' => 'task-8',
                            'title' => 'Database schema',
                            'description' => 'Design initial database schema and migrations',
                            'labels' => ['feature'],
                            'dueDate' => '2023-12-03',
                            'assignee' => 'Quinn'
                        ]
                    ]
                ]
            ]
        ];
    }
    
    // Ensure the columns data is directly available as a JSON string for Alpine.js
    $columnsJson = json_encode($kanbanBoardData['columns'] ?? []);
@endphp

<section id="kanban" class="py-16 relative z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl" 
                x-bind:class="darkMode ? 'text-white' : 'text-gray-900'">
                {{ $kanbanBoardData['sectionTitle'] ?? 'Task Management' }}
            </h2>
            <p class="mt-4 text-xl" 
               x-bind:class="darkMode ? 'text-gray-300' : 'text-gray-500'">
                Organize your tasks with our intuitive drag-and-drop Kanban board
            </p>
        </div>

        <!-- Load Sortable.js -->
        <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
        
        <div class="backdrop-blur-md shadow-lg rounded-3xl p-6"
             x-bind:style="darkMode ? 'background-color: rgba(6, 6, 20, 0.2);' : 'background-color: rgba(255, 255, 255, 0.1);'">
            
            <div id="kanban-board-container" 
                 x-data="{
                    columns: {{ $columnsJson }},
                    
                    // Find a card by its ID
                    findCardById(id) {
                        for (let column of this.columns) {
                            for (let i = 0; i < column.cards.length; i++) {
                                if (column.cards[i].id == id) {
                                    return { card: column.cards[i], column, index: i };
                                }
                            }
                        }
                        return null;
                    },
                    
                    // Handle card movement
                    moveCard(cardId, fromColumnId, toColumnId, newIndex) {
                        try {
                            // Find source column
                            const fromColumn = this.columns.find(col => col.id === fromColumnId);
                            if (!fromColumn) return;
                            
                            // Find card index in source column
                            const cardIndex = fromColumn.cards.findIndex(card => card.id === cardId);
                            if (cardIndex === -1) return;
                            
                            // Get the card
                            const card = fromColumn.cards[cardIndex];
                            
                            // Remove card from source column
                            fromColumn.cards.splice(cardIndex, 1);
                            
                            // Find destination column
                            const toColumn = this.columns.find(col => col.id === toColumnId);
                            if (!toColumn) return;
                            
                            // Add card to destination column at the specified index
                            toColumn.cards.splice(newIndex, 0, card);
                            
                            // Here you could add an API call to persist changes
                            // this.saveChanges();
                        } catch (error) {
                            console.error('Error moving card:', error);
                        }
                    },
                    
                    // Initialize Sortable on all columns
                    initSortable() {
                        // Get all column lists
                        const columnLists = document.querySelectorAll('.kanban-column-list');
                        const self = this;
                        
                        // Initialize Sortable on each column
                        columnLists.forEach(list => {
                            new Sortable(list, {
                                group: 'kanban',
                                animation: 150,
                                ghostClass: 'sortable-ghost',
                                dragClass: 'sortable-drag',
                                handle: '.kanban-card',
                                onEnd: function(evt) {
                                    const cardId = evt.item.getAttribute('data-card-id');
                                    const fromColumnId = evt.from.getAttribute('data-column-id');
                                    const toColumnId = evt.to.getAttribute('data-column-id');
                                    const newIndex = evt.newIndex;
                                    
                                    // Call the moveCard method to update the data model
                                    self.moveCard(cardId, fromColumnId, toColumnId, newIndex);
                                }
                            });
                        });
                    }
                }"
                 x-init="
                    // Initialize Sortable after Alpine is initialized
                    $nextTick(() => {
                        // If columns data is not available yet, wait for it
                        if (!columns || columns.length === 0) {
                            console.error('No columns data available');
                        } else {
                            // Data is already available, initialize immediately
                            initSortable();
                            console.log('Sortable initialized with data:', columns);
                        }
                    });
                 "
                class="kanban-board overflow-x-auto">
                <div class="flex space-x-4 min-w-max pb-4">
                    <template x-for="column in columns" :key="column.id">
                        <div class="kanban-column w-72 flex-shrink-0">
                            <div class="rounded-t-lg p-3 font-medium text-sm"
                                 x-bind:style="darkMode ? 'background-color: rgba(30, 30, 60, 0.5); color: white;' : 'background-color: rgba(240, 240, 250, 0.8); color: #374151;'">
                                <div class="flex items-center justify-between">
                                    <span x-text="column.title"></span>
                                    <span class="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs" x-text="column.cards.length"></span>
                                </div>
                            </div>
                            
                            <div class="rounded-b-lg min-h-[200px]"
                                 x-bind:style="darkMode ? 'background-color: rgba(15, 15, 30, 0.5);' : 'background-color: rgba(250, 250, 255, 0.5);'">
                                <ul class="kanban-column-list p-2 space-y-2 min-h-[200px]"
                                    x-bind:data-column-id="column.id">
                                    <template x-for="(card, index) in column.cards" :key="card.id">
                                        <li x-bind:data-card-id="card.id"
                                            class="kanban-card p-3 rounded-lg shadow cursor-move transition-all duration-200 hover:shadow-md"
                                            x-bind:style="darkMode ? 'background-color: #1a1a2e; color: #e5e7eb;' : 'background-color: white; color: #1f2937;'">
                                            <div class="flex flex-col">
                                                <h3 class="font-medium" x-text="card.title"></h3>
                                                <p class="text-xs mt-1" 
                                                   x-bind:style="darkMode ? 'color: #9ca3af;' : 'color: #6b7280;'"
                                                   x-text="card.description"></p>
                                                
                                                <!-- Card labels/tags if any -->
                                                <div class="flex flex-wrap gap-1 mt-2" x-show="card.labels && card.labels.length > 0">
                                                    <template x-for="label in card.labels" :key="label">
                                                        <span class="px-2 py-0.5 rounded-full text-xs" 
                                                              x-bind:class="{
                                                                'bg-blue-100 text-blue-800': label === 'feature',
                                                                'bg-red-100 text-red-800': label === 'bug',
                                                                'bg-green-100 text-green-800': label === 'improvement',
                                                                'bg-yellow-100 text-yellow-800': label === 'documentation',
                                                                'bg-purple-100 text-purple-800': label === 'question'
                                                              }"
                                                              x-text="label"></span>
                                                    </template>
                                                </div>
                                                
                                                <!-- Card footer with metadata -->
                                                <div class="flex justify-between items-center mt-3" x-show="card.dueDate || card.assignee">
                                                    <div x-show="card.dueDate" class="text-xs" 
                                                         x-bind:style="darkMode ? 'color: #9ca3af;' : 'color: #6b7280;'">
                                                        <svg class="w-3 h-3 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span x-text="card.dueDate"></span>
                                                    </div>
                                                    <div x-show="card.assignee" class="text-xs"
                                                         x-bind:style="darkMode ? 'color: #9ca3af;' : 'color: #6b7280;'">
                                                        <svg class="w-3 h-3 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span x-text="card.assignee"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    </template>
                                </ul>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            
            <style>
                /* Custom styles for the kanban board */
                .sortable-ghost {
                    opacity: 0.4;
                    background-color: #e2e8f0 !important;
                }
                
                .sortable-drag {
                    opacity: 0.9;
                    transform: rotate(2deg);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
                
                /* Custom scrollbar for the kanban board */
                .kanban-board::-webkit-scrollbar {
                    height: 8px;
                }
                
                .kanban-board::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                }
                
                .kanban-board::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 4px;
                }
                
                .kanban-board::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.3);
                }
            </style>
        </div>
    </div>
</section>