<?php

namespace App\Http\Requests;

use App\Enums\StatusSolicitacao;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStatusSolicitacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(StatusSolicitacao::class)],
        ];
    }

    public function statusEnum(): StatusSolicitacao
    {
        return StatusSolicitacao::from($this->validated('status'));
    }
}