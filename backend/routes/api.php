<?php

use App\Http\Controllers\Api\V1\SolicitacaoController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Bônus (2.5): health check validando a conexão com o PostgreSQL.
    Route::get('/health', function () {
        try {
            DB::connection()->getPdo();
            $conectado = true;
        } catch (\Throwable) {
            $conectado = false;
        }

        return response()->json([
            'status' => $conectado ? 'ok' : 'degraded',
            'database' => $conectado ? 'connected' : 'unavailable',
            'timestamp' => now()->toIso8601String(),
        ], $conectado ? 200 : 503);
    })->name('health');

    Route::get('solicitacoes', [SolicitacaoController::class, 'index'])->name('solicitacoes.index');
    Route::post('solicitacoes', [SolicitacaoController::class, 'store'])->name('solicitacoes.store');
    Route::get('solicitacoes/{solicitacao}', [SolicitacaoController::class, 'show'])->name('solicitacoes.show');
    Route::patch('solicitacoes/{solicitacao}/status', [SolicitacaoController::class, 'updateStatus'])
        ->name('solicitacoes.update-status');
});