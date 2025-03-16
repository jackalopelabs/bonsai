<?php

return [
    'sectionId' => 'kanban',
    'sectionTitle' => 'Challenge Tracker',
    'navLinks' => [
        [
            'url' => '#challenges',
            'label' => 'Challenges',
        ],
        [
            'url' => '#groups',
            'label' => 'Groups',
        ],
    ],
    'darkModeSupport' => true,
    'columns' => [
        [
            'id' => 'todo',
            'title' => 'To Do',
            'cards' => [
                [
                    'id' => 'card1',
                    'title' => 'Morning Meditation',
                    'description' => 'Complete 10 minutes of guided meditation',
                    'labels' => [
                        'habit',
                        'wellness',
                    ],
                    'dueDate' => 'Today',
                    'assignee' => 'You',
                ],
                [
                    'id' => 'card2',
                    'title' => 'Write Blog Post',
                    'description' => 'Draft 500 words for weekly blog',
                    'labels' => [
                        'content',
                        'writing',
                    ],
                    'dueDate' => 'Tomorrow',
                    'assignee' => 'You',
                ],
            ],
        ],
        [
            'id' => 'in-progress',
            'title' => 'In Progress',
            'cards' => [
                [
                    'id' => 'card3',
                    'title' => 'Exercise Routine',
                    'description' => '30 minutes of cardio and strength training',
                    'labels' => [
                        'habit',
                        'fitness',
                    ],
                    'dueDate' => 'Today',
                    'assignee' => 'You',
                ],
            ],
        ],
        [
            'id' => 'completed',
            'title' => 'Completed',
            'cards' => [
                [
                    'id' => 'card4',
                    'title' => 'Daily Reading',
                    'description' => 'Read 20 pages of current book',
                    'labels' => [
                        'habit',
                        'learning',
                    ],
                    'dueDate' => 'Yesterday',
                    'assignee' => 'You',
                ],
                [
                    'id' => 'card5',
                    'title' => 'Weekly Planning',
                    'description' => 'Set goals and schedule for the week',
                    'labels' => [
                        'productivity',
                    ],
                    'dueDate' => 'Last Monday',
                    'assignee' => 'You',
                ],
            ],
        ],
    ],
];
