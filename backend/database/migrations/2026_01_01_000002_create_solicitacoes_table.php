<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('solicitacoes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('protocolo')->unique();
            $table->string('nome_solicitante');
            $table->string('cpf_solicitante');
            $table->string('email_solicitante');
            $table->string('telefone_solicitante');
            $table->enum('categoria', ['CONSULTA', 'EXAME', 'VACINACAO', 'OUTRO']);
            $table->enum('prioridade', ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']);
            $table->enum('status', ['RECEBIDA', 'EM_ANALISE', 'AGENDADA', 'CONCLUIDA', 'CANCELADA'])->default('RECEBIDA');
            $table->text('descricao');
            $table->text('justificativa_prioridade')->nullable();
            $table->timestamp('data_criacao')->nullable();
            $table->timestamp('data_atualizacao')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitacoes');
    }
};