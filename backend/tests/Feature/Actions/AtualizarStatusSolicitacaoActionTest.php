<?php

namespace Tests\Feature\Actions;

use App\Actions\Solicitacao\AtualizarStatusSolicitacaoAction;
use App\Enums\StatusSolicitacao;
use App\Exceptions\TransicaoStatusInvalidaException;
use App\Models\Solicitacao;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AtualizarStatusSolicitacaoActionTest extends TestCase
{
    use RefreshDatabase;

    private AtualizarStatusSolicitacaoAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = app(AtualizarStatusSolicitacaoAction::class);
    }

    #[DataProvider('transicoesPermitidasProvider')]
    public function test_permite_transicoes_validas(StatusSolicitacao $de, StatusSolicitacao $para): void
    {
        $solicitacao = Solicitacao::factory()->comStatus($de)->create();

        $atualizada = $this->action->executar($solicitacao, $para);

        $this->assertSame($para, $atualizada->status);
        $this->assertSame($para, $solicitacao->fresh()->status);
    }

    public static function transicoesPermitidasProvider(): array
    {
        return [
            'RECEBIDA -> EM_ANALISE' => [StatusSolicitacao::RECEBIDA, StatusSolicitacao::EM_ANALISE],
            'RECEBIDA -> CANCELADA' => [StatusSolicitacao::RECEBIDA, StatusSolicitacao::CANCELADA],
            'EM_ANALISE -> AGENDADA' => [StatusSolicitacao::EM_ANALISE, StatusSolicitacao::AGENDADA],
            'EM_ANALISE -> CANCELADA' => [StatusSolicitacao::EM_ANALISE, StatusSolicitacao::CANCELADA],
            'AGENDADA -> CONCLUIDA' => [StatusSolicitacao::AGENDADA, StatusSolicitacao::CONCLUIDA],
            'AGENDADA -> CANCELADA' => [StatusSolicitacao::AGENDADA, StatusSolicitacao::CANCELADA],
        ];
    }

    #[DataProvider('transicoesInvalidasProvider')]
    public function test_bloqueia_transicoes_invalidas(StatusSolicitacao $de, StatusSolicitacao $para): void
    {
        $solicitacao = Solicitacao::factory()->comStatus($de)->create();

        $this->expectException(TransicaoStatusInvalidaException::class);

        $this->action->executar($solicitacao, $para);
    }

    public static function transicoesInvalidasProvider(): array
    {
        return [
            'RECEBIDA -> AGENDADA (pula EM_ANALISE)' => [StatusSolicitacao::RECEBIDA, StatusSolicitacao::AGENDADA],
            'RECEBIDA -> CONCLUIDA (pula tudo)' => [StatusSolicitacao::RECEBIDA, StatusSolicitacao::CONCLUIDA],
            'EM_ANALISE -> RECEBIDA (retrocede)' => [StatusSolicitacao::EM_ANALISE, StatusSolicitacao::RECEBIDA],
            'AGENDADA -> EM_ANALISE (retrocede)' => [StatusSolicitacao::AGENDADA, StatusSolicitacao::EM_ANALISE],
        ];
    }

    public function test_bloqueia_alteracao_de_status_final_concluida(): void
    {
        $solicitacao = Solicitacao::factory()->comStatus(StatusSolicitacao::CONCLUIDA)->create();

        $this->expectException(TransicaoStatusInvalidaException::class);

        $this->action->executar($solicitacao, StatusSolicitacao::EM_ANALISE);
    }

    public function test_bloqueia_alteracao_de_status_final_cancelada(): void
    {
        $solicitacao = Solicitacao::factory()->comStatus(StatusSolicitacao::CANCELADA)->create();

        $this->expectException(TransicaoStatusInvalidaException::class);

        $this->action->executar($solicitacao, StatusSolicitacao::RECEBIDA);
    }

    public function test_nao_persiste_mudanca_quando_transicao_invalida(): void
    {
        $solicitacao = Solicitacao::factory()->comStatus(StatusSolicitacao::RECEBIDA)->create();

        try {
            $this->action->executar($solicitacao, StatusSolicitacao::CONCLUIDA);
        } catch (TransicaoStatusInvalidaException) {
            // esperado — o teste verifica o estado após a exceção, não a exceção em si
        }

        $this->assertSame(StatusSolicitacao::RECEBIDA, $solicitacao->fresh()->status);
    }
}