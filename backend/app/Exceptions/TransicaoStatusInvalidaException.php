<?php

namespace App\Exceptions;

use App\Enums\StatusSolicitacao;
use Exception;

class TransicaoStatusInvalidaException extends Exception
{
    /** @var array<string, list<string>> */
    private array $errosPorCampo;

    private function __construct(string $message, array $errosPorCampo)
    {
        parent::__construct($message);
        $this->errosPorCampo = $errosPorCampo;
    }

    public static function transicaoNaoPermitida(StatusSolicitacao $de, StatusSolicitacao $para): self
    {
        $mensagem = sprintf('Não é permitido mudar de %s para %s.', $de->value, $para->value);

        return new self('Transição de status inválida.', ['status' => [$mensagem]]);
    }

    public static function statusFinal(StatusSolicitacao $statusAtual): self
    {
        $mensagem = sprintf(
            'A solicitação está em status final (%s) e não pode mais ser alterada.',
            $statusAtual->value
        );

        return new self('Transição de status inválida.', ['status' => [$mensagem]]);
    }

    /** @return array<string, list<string>> */
    public function errosPorCampo(): array
    {
        return $this->errosPorCampo;
    }
}