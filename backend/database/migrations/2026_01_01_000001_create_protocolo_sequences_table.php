<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('protocolo_sequences', function (Blueprint $table) {
            $table->integer('ano')->primary();
            $table->integer('ultimo_numero')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('protocolo_sequences');
    }
};