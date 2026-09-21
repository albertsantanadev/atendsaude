<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'protocolo' => $this->protocolo,
            'nome_solicitante' => $this->nome_solicitante,
            'categoria' => $this->categoria->value,
            'prioridade' => $this->prioridade->value,
            'status' => $this->status->value,
            'descricao' => $this->descricao,
            'justificativa_prioridade' => $this->justificativa_prioridade,
            'data_criacao' => $this->data_criacao?->toIso8601String(),
            'data_atualizacao' => $this->data_atualizacao?->toIso8601String(),
        ];
    }
}