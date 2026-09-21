<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_retorna_ok_quando_banco_esta_disponivel(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertOk();
        $response->assertJson(['status' => 'ok', 'database' => 'connected']);
        $response->assertJsonStructure(['status', 'database', 'timestamp']);
    }

    public function test_retorna_503_quando_banco_esta_indisponivel(): void
    {
        DB::shouldReceive('connection')
            ->once()
            ->andThrow(new \RuntimeException('Falha ao conectar ao banco.'));

        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(503);
        $response->assertJson(['status' => 'degraded', 'database' => 'unavailable']);
    }
}