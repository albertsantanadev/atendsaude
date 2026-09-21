<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreSolicitacaoTest extends TestCase
{
    use RefreshDatabase;

    public function test_cria_solicitacao_com_protocolo_gerado_automaticamente(): void
    {
        $payload = [
            'nome_solicitante' => 'Maria da Silva',
            'categoria' => 'CONSULTA',
            'prioridade' => 'ALTA',
            'descricao' => 'Encaminhamento para consulta cardiológica',
        ];

        $response = $this->postJson('/api/v1/solicitacoes', $payload);

        $response->assertCreated();
        $response->assertJsonPath('data.status', 'RECEBIDA');
        $response->assertJsonPath('data.nome_solicitante', 'Maria da Silva');

        $protocolo = $response->json('data.protocolo');
        $this->assertMatchesRegularExpression('/^SOL-\d{4}-\d{4}$/', $protocolo);

        $this->assertDatabaseCount('solicitacoes', 1);
    }

    public function test_gera_protocolos_sequenciais_e_unicos_para_o_mesmo_ano(): void
    {
        $payloadBase = [
            'categoria' => 'EXAME',
            'prioridade' => 'BAIXA',
            'descricao' => 'Exame de rotina',
        ];

        $primeira = $this->postJson('/api/v1/solicitacoes', [...$payloadBase, 'nome_solicitante' => 'Paciente 1']);
        $segunda = $this->postJson('/api/v1/solicitacoes', [...$payloadBase, 'nome_solicitante' => 'Paciente 2']);

        $protocoloPrimeira = $primeira->json('data.protocolo');
        $protocoloSegunda = $segunda->json('data.protocolo');

        $this->assertNotSame($protocoloPrimeira, $protocoloSegunda);

        preg_match('/^SOL-\d{4}-(\d{4})$/', $protocoloPrimeira, $matchesUm);
        preg_match('/^SOL-\d{4}-(\d{4})$/', $protocoloSegunda, $matchesDois);

        $this->assertSame((int) $matchesUm[1] + 1, (int) $matchesDois[1]);
    }

    public function test_rejeita_solicitacao_urgente_sem_justificativa(): void
    {
        $payload = [
            'nome_solicitante' => 'João Souza',
            'categoria' => 'VACINACAO',
            'prioridade' => 'URGENTE',
            'descricao' => 'Necessita vacina com urgência',
        ];

        $response = $this->postJson('/api/v1/solicitacoes', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['justificativa_prioridade']);

        $this->assertDatabaseCount('solicitacoes', 0);
    }

    public function test_aceita_solicitacao_urgente_com_justificativa(): void
    {
        $payload = [
            'nome_solicitante' => 'Ana Lima',
            'categoria' => 'VACINACAO',
            'prioridade' => 'URGENTE',
            'descricao' => 'Necessita vacina com urgência',
            'justificativa_prioridade' => 'Paciente com exposição confirmada a doença transmissível.',
        ];

        $response = $this->postJson('/api/v1/solicitacoes', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('solicitacoes', [
            'nome_solicitante' => 'Ana Lima',
            'prioridade' => 'URGENTE',
        ]);
    }

    public function test_rejeita_categoria_invalida(): void
    {
        $response = $this->postJson('/api/v1/solicitacoes', [
            'nome_solicitante' => 'Teste',
            'categoria' => 'CATEGORIA_INEXISTENTE',
            'prioridade' => 'BAIXA',
            'descricao' => 'Teste',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['categoria']);
    }
}