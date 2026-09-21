<?php

namespace App\Enums;

enum CategoriaSolicitacao: string
{
    case CONSULTA = 'CONSULTA';
    case EXAME = 'EXAME';
    case VACINACAO = 'VACINACAO';
    case OUTRO = 'OUTRO';
}