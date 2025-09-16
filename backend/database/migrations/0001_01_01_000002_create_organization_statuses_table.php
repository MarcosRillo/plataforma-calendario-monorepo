<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('organization_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('status_code', 50)->unique();
            $table->string('status_name', 100);
            $table->text('description')->nullable();
            $table->boolean('can_create_events')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_statuses');
    }
};
