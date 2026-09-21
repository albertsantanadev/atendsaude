<?php

namespace App\Actions\Solicitacao;

use App\Enums\StatusSolicitacao;
use App\Exceptions\TransicaoStatusInvalidaException;
use App\Models\Solicitacao;
use Illuminate\Support\Facades\DB;

class AtualizarStatusSolicitacaoAction
{
    /**
     * @throws TransicaoStatusInvalidaException quando a transição é ilegal
     *         ou o status atual já é final (CONCLUIDA/CANCELADA).
     */
    public function executar(Solicitacao $solicitacao, StatusSolicitacao $novoStatus): Solicitacao
    {
        $statusAtual = $solicitacao->status;

        if ($statusAtual->isFinal()) {
            throw TransicaoStatusInvalidaException::statusFinal($statusAtual);
        }

        if (! $statusAtual->podeTransicionarPara($novoStatus)) {
            throw TransicaoStatusInvalidaException::transicaoNaoPermitida($statusAtual, $novoStatus);
        }

        return DB::transaction(function () use ($solicitacao, $novoStatus) {
            $solicitacao->status = $novoStatus;
            $solicitacao->save();

            return $solicitacao->fresh();
        });
    }
}