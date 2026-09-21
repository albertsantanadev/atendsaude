<?php

namespace App\Actions\Solicitacao;

use Illuminate\Support\Facades\DB;

class GerarProtocoloAction
{
    public function executar(?int $ano = null): string
    {
        $ano ??= (int) now()->format('Y');

        $numero = DB::selectOne(<<<'SQL'
INSERT INTO protocolo_sequences (ano, ultimo_numero)
VALUES (?, 1)
ON CONFLICT (ano)
DO UPDATE SET ultimo_numero = protocolo_sequences.ultimo_numero + 1
RETURNING ultimo_numero
SQL, [$ano])->ultimo_numero;

        return sprintf('SOL-%d-%04d', $ano, $numero);
    }
}