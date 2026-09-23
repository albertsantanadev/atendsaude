<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Remove os tipos ENUM se já existirem na base (evita erro durante os testes)
        DB::statement('DROP TYPE IF EXISTS categoria_solicitacao CASCADE');
        DB::statement('DROP TYPE IF EXISTS prioridade_solicitacao CASCADE');
        DB::statement('DROP TYPE IF EXISTS status_solicitacao CASCADE');

        // 2. Cria os tipos ENUM customizados no PostgreSQL
        DB::statement("CREATE TYPE categoria_solicitacao AS ENUM ('CONSULTA', 'EXAME', 'VACINACAO', 'OUTRO')");
        DB::statement("CREATE TYPE prioridade_solicitacao AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')");
        DB::statement("CREATE TYPE status_solicitacao AS ENUM ('RECEBIDA', 'EM_ANALISE', 'AGENDADA', 'CONCLUIDA', 'CANCELADA')");

        // 3. Cria a tabela de solicitações
        Schema::create('solicitacoes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('protocolo')->unique();
            $table->string('nome_solicitante');
            $table->string('cpf_solicitante');
            $table->string('email_solicitante');
            $table->string('telefone_solicitante');
            
            // Colunas usando os tipos ENUM criados acima
            $table->addColumn('categoria_solicitacao', 'categoria');
            $table->addColumn('prioridade_solicitacao', 'prioridade');
            $table->addColumn('status_solicitacao', 'status')->default('RECEBIDA');

            $table->text('descricao');
            $table->text('justificativa_urgencia')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitacoes');

        DB::statement('DROP TYPE IF EXISTS categoria_solicitacao CASCADE');
        DB::statement('DROP TYPE IF EXISTS prioridade_solicitacao CASCADE');
        DB::statement('DROP TYPE IF EXISTS status_solicitacao CASCADE');
    }
};