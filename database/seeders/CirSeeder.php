<?php

namespace Database\Seeders;

use App\Models\Issue;
use App\Models\IssueActivityLog;
use App\Models\IssueComment;
use App\Models\Task;
use App\Models\TaskStep;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CirSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@cir.rw'],
            [
                'name' => 'Jean Mukamana',
                'phone' => '+250788123456',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'language' => 'en',
            ]
        );

        $worker1 = User::query()->updateOrCreate(
            ['phone' => '+250788111222'],
            [
                'name' => 'Emmanuel Niyonsaba',
                'email' => 'emmanuel.worker@cir.rw',
                'password' => Hash::make('password'),
                'role' => 'worker',
                'status' => 'active',
                'language' => 'en',
            ]
        );

        $worker2 = User::query()->updateOrCreate(
            ['phone' => '+250788333444'],
            [
                'name' => 'Grace Uwimana',
                'email' => 'grace.worker@cir.rw',
                'password' => Hash::make('password'),
                'role' => 'worker',
                'status' => 'active',
                'language' => 'en',
            ]
        );

        User::query()->updateOrCreate(
            ['phone' => '+250788555666'],
            [
                'name' => 'David Nkurunziza',
                'email' => 'david.worker@cir.rw',
                'password' => Hash::make('password'),
                'role' => 'worker',
                'status' => 'invited',
                'language' => 'en',
            ]
        );

        $citizen = User::query()->updateOrCreate(
            ['email' => 'citizen1@cir.rw'],
            [
                'name' => 'Eric Nshimiyimana',
                'phone' => '+250788999888',
                'password' => Hash::make('password'),
                'role' => 'citizen',
                'status' => 'active',
                'language' => 'en',
            ]
        );

        if (Issue::query()->exists()) {
            return;
        }

        $issues = [
            [
                'reference_number' => 'CIR-2026-00001',
                'reporter_name' => 'Eric Nshimiyimana',
                'title' => 'Large pothole on KG 11 Ave near market',
                'description' => 'There is a deep pothole near the market causing accidents for vehicles and pedestrians.',
                'district' => 'Gasabo',
                'sector' => 'Remera',
                'status' => 'submitted',
                'citizen_priority' => 4,
                'ai_priority' => 4,
                'ai_category' => 'roads',
                'ai_summary' => 'Deep pothole on KG 11 Ave near market in Gasabo. Safety hazard for vehicles and pedestrians.',
                'ai_tags' => ['pothole', 'accident-risk', 'market-area'],
                'ai_confidence' => 0.87,
                'community_score' => 12,
                'final_priority' => 4.2,
                'latitude' => -1.9441,
                'longitude' => 30.0619,
            ],
            [
                'reference_number' => 'CIR-2026-00002',
                'reporter_name' => 'Marie Uwase',
                'title' => 'Broken water pipe flooding street in Kicukiro',
                'description' => 'A main water pipe burst on Friday. Water is flooding the road and entering nearby homes.',
                'district' => 'Kicukiro',
                'sector' => 'Niboye',
                'status' => 'under_review',
                'citizen_priority' => 5,
                'ai_priority' => 5,
                'ai_category' => 'water',
                'ai_summary' => 'Burst water main in Kicukiro causing flooding and property damage.',
                'ai_tags' => ['burst-pipe', 'flooding'],
                'ai_confidence' => 0.92,
                'community_score' => 18,
                'final_priority' => 4.8,
                'latitude' => -1.9891,
                'longitude' => 30.1122,
            ],
            [
                'reference_number' => 'CIR-2026-00003',
                'reporter_name' => 'Anonymous Citizen',
                'is_anonymous' => true,
                'title' => 'Uncollected garbage near Nyabugogo bus station',
                'description' => 'Garbage has not been collected for over a week.',
                'district' => 'Nyarugenge',
                'sector' => 'Nyakabanda',
                'status' => 'assigned',
                'citizen_priority' => 3,
                'ai_priority' => 3,
                'ai_category' => 'sanitation',
                'ai_summary' => 'Uncollected waste near Nyabugogo bus station posing health risks.',
                'ai_tags' => ['garbage', 'sanitation'],
                'ai_confidence' => 0.81,
                'community_score' => 7,
                'final_priority' => 3.1,
                'latitude' => -1.9397,
                'longitude' => 30.0444,
            ],
            [
                'reference_number' => 'CIR-2026-00004',
                'reporter_name' => 'Patrick Habimana',
                'title' => 'Street lights not working on KN 3 Rd',
                'description' => 'Multiple street lights have been out for two weeks.',
                'district' => 'Gasabo',
                'sector' => 'Kimironko',
                'status' => 'in_progress',
                'citizen_priority' => 3,
                'ai_priority' => 2,
                'ai_category' => 'electricity',
                'ai_summary' => 'Multiple street lights out on KN 3 Rd in Gasabo.',
                'ai_tags' => ['street-lights'],
                'ai_confidence' => 0.75,
                'community_score' => 4,
                'final_priority' => 2.8,
                'admin_priority_override' => 3,
                'latitude' => -1.9706,
                'longitude' => 30.1044,
            ],
            [
                'reference_number' => 'CIR-2026-00005',
                'reporter_name' => 'Claire Mutoni',
                'title' => 'Damaged bridge railing in Huye district',
                'description' => 'The railing on the small bridge near the university is broken.',
                'district' => 'Huye',
                'sector' => 'Tumba',
                'status' => 'resolved',
                'citizen_priority' => 4,
                'ai_priority' => 4,
                'ai_category' => 'roads',
                'ai_summary' => 'Broken bridge railing in Huye near university campus.',
                'ai_tags' => ['bridge', 'safety'],
                'ai_confidence' => 0.88,
                'community_score' => 9,
                'final_priority' => 4.0,
                'resolved_at' => now()->subDay(),
                'latitude' => -2.5967,
                'longitude' => 29.7386,
            ],
        ];

        $createdIssues = [];
        foreach ($issues as $issueData) {
            $createdIssues[] = Issue::query()->create([
                ...$issueData,
                'user_id' => $citizen->id,
            ]);
        }

        IssueComment::query()->create([
            'issue_id' => $createdIssues[0]->id,
            'user_id' => $citizen->id,
            'body' => 'I drive through this area daily — the pothole is getting worse.',
        ]);

        IssueActivityLog::query()->create([
            'issue_id' => $createdIssues[0]->id,
            'action' => 'Issue submitted',
            'metadata' => ['status' => 'submitted'],
        ]);

        IssueActivityLog::query()->create([
            'issue_id' => $createdIssues[0]->id,
            'action' => 'AI triage completed',
            'metadata' => ['ai_category' => 'roads'],
        ]);

        $task1 = Task::query()->create([
            'issue_id' => $createdIssues[2]->id,
            'assigned_to' => $worker1->id,
            'assigned_by' => $admin->id,
            'title' => 'Sanitation cleanup — Nyabugogo',
            'admin_notes' => 'Coordinate with district sanitation team.',
            'status' => 'in_progress',
            'due_date' => now()->addDays(5),
        ]);

        TaskStep::query()->create(['task_id' => $task1->id, 'title' => 'Inspect site', 'order' => 1, 'added_by' => 'admin', 'is_completed' => true]);
        TaskStep::query()->create(['task_id' => $task1->id, 'title' => 'Schedule collection', 'order' => 2, 'added_by' => 'admin']);

        Task::query()->create([
            'issue_id' => $createdIssues[3]->id,
            'assigned_to' => $worker2->id,
            'assigned_by' => $admin->id,
            'title' => 'Repair street lights — KN 3 Rd',
            'status' => 'todo',
            'due_date' => now()->addDays(7),
        ]);
    }
}
