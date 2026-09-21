<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Solicitacao\AtualizarStatusSolicitacaoAction;
use App\Actions\Solicitacao\CriarSolicitacaoAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSolicitacaoRequest;
use App\Http\Requests\UpdateStatusSolicitacaoRequest;
use App\Http\Resources\SolicitacaoResource;
use App\Models\Solicitacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SolicitacaoController extends Controller
{
    public function __construct(
        private readonly CriarSolicitacaoAction $criarSolicitacao,
        private readonly AtualizarStatusSolicitacaoAction $atualizarStatus,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 15), 100);

        $solicitacoes = Solicitacao::query()
            ->comStatus($request->query('status'))
            ->comCategoria($request->query('categoria'))
            ->comPrioridade($request->query('prioridade'))
            ->orderByDesc('data_criacao')
            ->paginate($perPage)
            ->appends($request->query());

        return SolicitacaoResource::collection($solicitacoes)->response();
    }

    public function store(StoreSolicitacaoRequest $request): JsonResponse
    {
        $solicitacao = $this->criarSolicitacao->executar($request->validated());

        return (new SolicitacaoResource($solicitacao))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Solicitacao $solicitacao): JsonResponse
    {
        return (new SolicitacaoResource($solicitacao))->response();
    }

    public function updateStatus(UpdateStatusSolicitacaoRequest $request, Solicitacao $solicitacao): JsonResponse
    {
        $atualizada = $this->atualizarStatus->executar($solicitacao, $request->statusEnum());

        return (new SolicitacaoResource($atualizada))->response();
    }
}