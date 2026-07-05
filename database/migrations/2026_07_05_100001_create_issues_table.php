<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 20)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reporter_name');
            $table->boolean('is_anonymous')->default(false);
            $table->string('title', 200);
            $table->text('description');
            $table->string('district', 100);
            $table->string('sector', 100)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status', 30)->default('submitted');
            $table->unsignedTinyInteger('citizen_priority')->default(3);
            $table->unsignedTinyInteger('ai_priority')->nullable();
            $table->string('ai_category', 50)->nullable();
            $table->text('ai_summary')->nullable();
            $table->json('ai_tags')->nullable();
            $table->decimal('ai_confidence', 3, 2)->nullable();
            $table->integer('community_score')->default(0);
            $table->decimal('final_priority', 3, 1)->default(3);
            $table->unsignedTinyInteger('admin_priority_override')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issues');
    }
};
