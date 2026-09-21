<?php

namespace App\Enums;

enum StatusSolicitacao: string
{
    case RECEBIDA = 'RECEBIDA';
    case EM_ANALISE = 'EM_ANALISE';
    case AGENDADA = 'AGENDADA';
    case CONCLUIDA = 'CONCLUIDA';
    case CANCELADA = 'CANCELADA';

    public static function transicoesPermitidas(): array
    {
        return [
            self::RECEBIDA->value => [self::EM_ANALISE, self::CANCELADA],
            self::EM_ANALISE->value => [self::AGENDADA, self::CANCELADA],
            self::AGENDADA->value => [self::CONCLUIDA, self::CANCELADA],
            self::CONCLUIDA->value => [],
            self::CANCELADA->value => [],
        ];
    }

    public function podeTransicionarPara(self $novoStatus): bool
    {
        $permitidos = self::transicoesPermitidas()[$this->value];

        return in_array($novoStatus, $permitidos, true);
    }

    public function isFinal(): bool
    {
        return $this === self::CONCLUIDA || $this === self::CANCELADA;
    }
}