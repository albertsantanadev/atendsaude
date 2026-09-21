<?php

namespace App\Actions\Solicitacao;

use App\Models\Solicitacao;
use Illuminate\Support\Facades\DB;

class CriarSolicitacaoAction
{
    public function __construct(
        private readonly GerarProtocoloAction $gerarProtocolo,
    ) {
    }

    public function executar(array $dados): Solicitacao
    {
        return DB::transaction(function () use ($dados) {
            $dados['protocolo'] = $this->gerarProtocolo->executar();

            return Solicitacao::create($dados);
        });
    }
}