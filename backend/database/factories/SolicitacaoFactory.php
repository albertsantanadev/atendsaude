<?php

namespace Database\Factories;

use App\Enums\CategoriaSolicitacao;
use App\Enums\PrioridadeSolicitacao;
use App\Enums\StatusSolicitacao;
use App\Models\Solicitacao;
use Illuminate\Database\Eloquent\Factories\Factory;

class SolicitacaoFactory extends Factory
{
    protected $model = Solicitacao::class;

    public function definition(): array
    {
        $prioridade = fake()->randomElement(PrioridadeSolicitacao::cases());

        return [
            'protocolo' => $this->protocoloFake(),
            'nome_solicitante' => fake()->name(),
            'categoria' => fake()->randomElement(CategoriaSolicitacao::cases()),
            'prioridade' => $prioridade,
            'status' => StatusSolicitacao::RECEBIDA,
            'descricao' => fake()->sentence(12),
            'justificativa_prioridade' => $prioridade === PrioridadeSolicitacao::URGENTE
                ? fake()->sentence(8)
                : null,
        ];
    }

    private function protocoloFake(): string
    {
        return sprintf('SOL-%d-%04d', now()->year, fake()->unique()->numberBetween(1, 9999));
    }

    public function comStatus(StatusSolicitacao $status): static
    {
        return $this->state(fn () => ['status' => $status]);
    }

    public function urgente(): static
    {
        return $this->state(fn () => [
            'prioridade' => PrioridadeSolicitacao::URGENTE,
            'justificativa_prioridade' => fake()->sentence(8),
        ]);
    }
}