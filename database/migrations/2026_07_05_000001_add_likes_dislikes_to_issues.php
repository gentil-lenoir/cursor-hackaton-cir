<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issue_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('reaction', ['like', 'dislike']);
            $table->timestamps();

            $table->unique(['issue_id', 'user_id']);
            $table->index(['issue_id', 'reaction']);
        });

        if (Schema::hasTable('upvotes')) {
            DB::table('upvotes')
                ->orderBy('id')
                ->get()
                ->each(function ($row): void {
                    DB::table('issue_reactions')->insert([
                        'issue_id' => $row->issue_id,
                        'user_id' => $row->user_id,
                        'reaction' => 'like',
                        'created_at' => $row->created_at,
                        'updated_at' => $row->updated_at,
                    ]);
                });

            Schema::drop('upvotes');
        }

        Schema::table('issues', function (Blueprint $table) {
            $table->unsignedInteger('dislikes_count')->default(0)->after('upvotes_count');
        });

        if (Schema::hasColumn('issues', 'upvotes_count')) {
            Schema::table('issues', function (Blueprint $table) {
                $table->renameColumn('upvotes_count', 'likes_count');
            });
        }
    }

    public function down(): void
    {
        Schema::create('upvotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['issue_id', 'user_id']);
            $table->index(['issue_id', 'created_at']);
        });

        DB::table('issue_reactions')
            ->where('reaction', 'like')
            ->orderBy('id')
            ->get()
            ->each(function ($row): void {
                DB::table('upvotes')->insert([
                    'issue_id' => $row->issue_id,
                    'user_id' => $row->user_id,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ]);
            });

        if (Schema::hasColumn('issues', 'likes_count')) {
            Schema::table('issues', function (Blueprint $table) {
                $table->renameColumn('likes_count', 'upvotes_count');
            });
        }

        Schema::table('issues', function (Blueprint $table) {
            $table->dropColumn('dislikes_count');
        });

        Schema::dropIfExists('issue_reactions');
    }
};
