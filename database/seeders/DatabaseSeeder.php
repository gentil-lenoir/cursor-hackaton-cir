<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Issue;
use App\Models\User;
use App\Models\Worker;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    private const DEMO_ISSUE_TITLES = [
        'Streetlight not working near park',
        'Overflowing roadside garbage bin',
        'Water leakage beside ward office',
        'Large pothole causing traffic jam',
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            Issue::query()
                ->whereIn('title', self::DEMO_ISSUE_TITLES)
                ->delete();

            Issue::query()->update([
                'worker_id' => null,
                'deadline' => null,
                'escalated_to' => null,
                'escalated_at' => null,
            ]);

            Worker::query()->delete();

            User::query()
                ->where('role', User::ROLE_SYSTEM_MANAGER)
                ->delete();

            User::query()
                ->where('role', User::ROLE_MUNICIPAL_MANAGER)
                ->where('email', '!=', 'admin2004@gmail.com')
                ->delete();

            User::query()->updateOrCreate(
                ['email' => 'admin2004@gmail.com'],
                [
                    'name' => 'Aarav Municipal Manager',
                    'password' => Hash::make('admin123'),
                    'role' => User::ROLE_MUNICIPAL_MANAGER,
                    'phone' => '9000000001',
                    'availability_status' => 'available',
                    'email_verified_at' => now(),
                ]
            );

            User::query()->updateOrCreate(
                ['email' => 'citizen.demo@civic.local'],
                [
                    'name' => 'Demo Citizen',
                    'password' => Hash::make('citizen123'),
                    'role' => User::ROLE_CITIZEN,
                    'phone' => '9000000003',
                    'preferred_location' => 'Kigali, Rwanda',
                    'theme_preference' => 'light',
                    'notify_email' => true,
                    'notify_sms' => false,
                    'community_alerts' => true,
                    'availability_status' => 'available',
                    'email_verified_at' => now(),
                ]
            );

            $this->upsertDepartment('Sanitation', 'Waste collection and public area cleanliness.');
            $this->upsertDepartment('Electricity', 'Streetlight and electrical maintenance.');
            $this->upsertDepartment('Water Supply', 'Pipe leakage and water pressure support.');

            Worker::query()->updateOrCreate(
                ['email' => 'worker.sanitation@civic.local'],
                [
                    'name' => 'Priya Sanitation',
                    'phone' => '9000000101',
                    'department_id' => Department::query()->where('name', 'Sanitation')->value('id'),
                    'password' => Hash::make('worker123'),
                    'status' => Worker::STATUS_ACTIVE,
                    'availability_status' => 'available',
                    'theme_preference' => 'light',
                    'preferred_zone' => 'Kigali Central',
                    'shift_window' => '08:00 AM - 05:00 PM',
                    'notify_new_assignments' => true,
                    'notify_escalation_alerts' => true,
                    'notify_daily_summary' => false,
                ]
            );

            Worker::query()->updateOrCreate(
                ['email' => 'worker.electricity@civic.local'],
                [
                    'name' => 'Arjun Electricity',
                    'phone' => '9000000102',
                    'department_id' => Department::query()->where('name', 'Electricity')->value('id'),
                    'password' => Hash::make('worker123'),
                    'status' => Worker::STATUS_ACTIVE,
                    'availability_status' => 'busy',
                    'theme_preference' => 'dark',
                    'preferred_zone' => 'Kigali North',
                    'shift_window' => '09:00 AM - 06:00 PM',
                    'notify_new_assignments' => true,
                    'notify_escalation_alerts' => true,
                    'notify_daily_summary' => true,
                ]
            );

            Worker::query()->updateOrCreate(
                ['email' => 'worker.water@civic.local'],
                [
                    'name' => 'Meera Water',
                    'phone' => '9000000103',
                    'department_id' => Department::query()->where('name', 'Water Supply')->value('id'),
                    'password' => Hash::make('worker123'),
                    'status' => Worker::STATUS_INACTIVE,
                    'availability_status' => 'offline',
                    'theme_preference' => 'light',
                    'preferred_zone' => 'Kigali South',
                    'shift_window' => '10:00 AM - 06:00 PM',
                    'notify_new_assignments' => false,
                    'notify_escalation_alerts' => false,
                    'notify_daily_summary' => false,
                ]
            );
        });
    }

    private function upsertDepartment(string $name, string $description): Department
    {
        return Department::query()->updateOrCreate(
            ['name' => $name],
            [
                'code' => strtoupper(str_replace(' ', '', substr($name, 0, 8))),
                'description' => $description,
            ]
        );
    }
}
