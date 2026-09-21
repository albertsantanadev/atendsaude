<?php

namespace App\Enums;

enum PrioridadeSolicitacao: string
{
    case BAIXA = 'BAIXA';
    case MEDIA = 'MEDIA';
    case ALTA = 'ALTA';
    case URGENTE = 'URGENTE';

    public function exigeJustificativa(): bool
    {
        return $this === self::URGENTE;
    }
}