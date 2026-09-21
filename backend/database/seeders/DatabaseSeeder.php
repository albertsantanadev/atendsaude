<?php

namespace Database\Seeders;

use App\Enums\StatusSolicitacao;
use App\Models\Solicitacao;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {
        Solicitacao::factory()->count(10)->comStatus(StatusSolicitacao::RECEBIDA)->create();
        Solicitacao::factory()->count(8)->comStatus(StatusSolicitacao::EM_ANALISE)->create();
        Solicitacao::factory()->count(6)->comStatus(StatusSolicitacao::AGENDADA)->create();
        Solicitacao::factory()->count(10)->comStatus(StatusSolicitacao::CONCLUIDA)->create();
        Solicitacao::factory()->count(4)->comStatus(StatusSolicitacao::CANCELADA)->create();
        Solicitacao::factory()->count(5)->urgente()->create();
    }
}