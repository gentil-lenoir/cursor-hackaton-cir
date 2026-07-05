<?php

namespace Tests\Feature;

use App\Models\District;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IssueSubmissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        District::query()->create([
            'name' => 'Gasabo',
            'province' => 'Kigali City',
        ]);
    }

    public function test_guest_cannot_submit_issue(): void
    {
        $response = $this->postJson('/api/v1/issues', [
            'reporter_name' => 'Jean',
            'title' => 'Broken road',
            'description' => 'Large pothole on main street.',
            'district' => 'Gasabo',
            'citizen_priority' => 3,
        ]);

        $response->assertUnauthorized();
    }

    public function test_citizen_can_submit_issue(): void
    {
        $user = User::factory()->create([
            'role' => 'citizen',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/issues', [
            'reporter_name' => 'Jean Uwimana',
            'title' => 'Broken road in Remera',
            'description' => 'Large pothole causing traffic delays.',
            'district' => 'Gasabo',
            'sector' => 'Remera',
            'citizen_priority' => 4,
            'is_anonymous' => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('issue.title', 'Broken road in Remera')
            ->assertJsonPath('issue.status', 'submitted')
            ->assertJsonPath('issue.district', 'Gasabo')
            ->assertJsonPath('issue.is_anonymous', true);

        $referenceNumber = $response->json('issue.reference_number');
        $this->assertMatchesRegularExpression('/^CIR-\d{4}-\d{5}$/', $referenceNumber);

        $this->assertDatabaseHas('issues', [
            'user_id' => $user->id,
            'reference_number' => $referenceNumber,
            'status' => 'submitted',
            'citizen_priority' => 4,
        ]);
    }

    public function test_report_page_requires_authentication(): void
    {
        $this->get('/report')->assertRedirect('/login');
    }

    public function test_authenticated_citizen_can_view_report_page(): void
    {
        $user = User::factory()->create([
            'role' => 'citizen',
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->get('/report')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('ReportIssue')
                ->has('districts', 1)
            );
    }
}
