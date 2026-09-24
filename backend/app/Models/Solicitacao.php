<?php

namespace App\Models;

use App\Enums\CategoriaSolicitacao;
use App\Enums\PrioridadeSolicitacao;
use App\Enums\StatusSolicitacao;
use Database\Factories\SolicitacaoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Solicitacao extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'solicitacoes';

    public $incrementing = false;

    protected $keyType = 'string';

    const CREATED_AT = 'data_criacao';

    const UPDATED_AT = 'data_atualizacao';

    protected $attributes = [
        'status' => StatusSolicitacao::RECEBIDA,
    ];

    protected $fillable = [
        'protocolo',
        'nome_solicitante',
        'cpf_solicitante',
        'email_solicitante',
        'telefone_solicitante',
        'categoria',
        'prioridade',
        'status',
        'descricao',
        'justificativa_prioridade',
    ];

    protected $casts = [
        'categoria' => CategoriaSolicitacao::class,
        'prioridade' => PrioridadeSolicitacao::class,
        'status' => StatusSolicitacao::class,
        'data_criacao' => 'datetime',
        'data_atualizacao' => 'datetime',
    ];

    protected static function newFactory(): SolicitacaoFactory
    {
        return SolicitacaoFactory::new();
    }

    public function scopeComStatus(Builder $query, ?string $status): Builder
    {
        return $status ? $query->where('status', $status) : $query;
    }

    public function scopeComCategoria(Builder $query, ?string $categoria): Builder
    {
        return $categoria ? $query->where('categoria', $categoria) : $query;
    }

    public function scopeComPrioridade(Builder $query, ?string $prioridade): Builder
    {
        return $prioridade ? $query->where('prioridade', $prioridade) : $query;
    }
}