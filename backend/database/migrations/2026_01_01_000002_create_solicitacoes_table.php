<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("CREATE TYPE categoria_solicitacao AS ENUM ('CONSULTA', 'EXAME', 'VACINACAO', 'OUTRO')");
        DB::statement("CREATE TYPE prioridade_solicitacao AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')");
        DB::statement("CREATE TYPE status_solicitacao AS ENUM ('RECEBIDA', 'EM_ANALISE', 'AGENDADA', 'CONCLUIDA', 'CANCELADA')");

        DB::statement(<<<'SQL'
CREATE TABLE solicitacoes (
    id                        UUID PRIMARY KEY,
    protocolo                 VARCHAR(20)  NOT NULL UNIQUE,
    nome_solicitante          VARCHAR(150) NOT NULL,
    categoria                 categoria_solicitacao  NOT NULL,
    prioridade                prioridade_solicitacao NOT NULL,
    status                    status_solicitacao     NOT NULL DEFAULT 'RECEBIDA',
    descricao                 TEXT NOT NULL,
    justificativa_prioridade  TEXT NULL,
    data_criacao              TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_atualizacao          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_justificativa_urgente
        CHECK (prioridade <> 'URGENTE' OR justificativa_prioridade IS NOT NULL)
)
SQL);

        DB::statement('CREATE INDEX idx_solicitacoes_status ON solicitacoes (status)');
        DB::statement('CREATE INDEX idx_solicitacoes_categoria ON solicitacoes (categoria)');
        DB::statement('CREATE INDEX idx_solicitacoes_prioridade ON solicitacoes (prioridade)');
        DB::statement('CREATE INDEX idx_solicitacoes_criacao ON solicitacoes (data_criacao DESC)');
        DB::statement('CREATE INDEX idx_solicitacoes_filtros_combo ON solicitacoes (status, categoria, prioridade)');
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitacoes');
        DB::statement('DROP TYPE IF EXISTS status_solicitacao');
        DB::statement('DROP TYPE IF EXISTS prioridade_solicitacao');
        DB::statement('DROP TYPE IF EXISTS categoria_solicitacao');
    }
};