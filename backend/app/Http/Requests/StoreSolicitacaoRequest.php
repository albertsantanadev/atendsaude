<?php

namespace App\Http\Requests;

use App\Enums\CategoriaSolicitacao;
use App\Enums\PrioridadeSolicitacao;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreSolicitacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome_solicitante' => ['required', 'string', 'max:150'],
            'categoria' => ['required', Rule::enum(CategoriaSolicitacao::class)],
            'prioridade' => ['required', Rule::enum(PrioridadeSolicitacao::class)],
            'descricao' => ['required', 'string'],
            'justificativa_prioridade' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome_solicitante.required' => 'Informe o nome do solicitante.',
            'categoria.required' => 'Selecione uma categoria válida.',
            'prioridade.required' => 'Selecione uma prioridade válida.',
            'descricao.required' => 'Descreva a solicitação.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $prioridade = $this->input('prioridade');
            $justificativa = $this->input('justificativa_prioridade');

            if ($prioridade === PrioridadeSolicitacao::URGENTE->value && blank($justificativa)) {
                $validator->errors()->add(
                    'justificativa_prioridade',
                    'O campo justificativa da prioridade é obrigatório quando a prioridade é URGENTE.'
                );
            }
        });
    }
}