import { useState, type FormEvent } from 'react';
import { AlertCircle, Send, X } from 'lucide-react';
import { CATEGORIAS, PRIORIDADES, type SolicitacaoCreateInput } from '../types/solicitacao';

interface Props {
  aoSubmeter: (dados: SolicitacaoCreateInput) => Promise<void>;
  enviando: boolean;
  errosPorCampo: Record<string, string[]> | null;
}

const ESTADO_INICIAL: SolicitacaoCreateInput = {
  nome_solicitante: '',
  categoria: 'CONSULTA',
  prioridade: 'BAIXA',
  descricao: '',
  justificativa_prioridade: '',
};

function CampoErro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;

  return (
    <span className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
      <AlertCircle size={13} />
      {mensagem}
    </span>
  );
}

export function FormularioSolicitacao({ aoSubmeter, enviando, errosPorCampo }: Props) {
  const [dados, setDados] = useState<SolicitacaoCreateInput>(ESTADO_INICIAL);
  const precisaJustificativa = dados.prioridade === 'URGENTE';

  function erroDoCampo(campo: string): string | undefined {
    return errosPorCampo?.[campo]?.[0];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await aoSubmeter({
      ...dados,
      justificativa_prioridade: precisaJustificativa ? dados.justificativa_prioridade : null,
    });
  }

  function limpar() {
    setDados(ESTADO_INICIAL);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-4">
        <label htmlFor="nome_solicitante" className="label-base">
          Nome do solicitante *
        </label>
        <input
          id="nome_solicitante"
          type="text"
          maxLength={150}
          className="input-base"
          value={dados.nome_solicitante}
          onChange={(e) => setDados({ ...dados, nome_solicitante: e.target.value })}
          aria-invalid={Boolean(erroDoCampo('nome_solicitante'))}
          required
        />
        <CampoErro mensagem={erroDoCampo('nome_solicitante')} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoria" className="label-base">
            Categoria *
          </label>
          <select
            id="categoria"
            className="input-base"
            value={dados.categoria}
            onChange={(e) =>
              setDados({ ...dados, categoria: e.target.value as SolicitacaoCreateInput['categoria'] })
            }
          >
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="prioridade" className="label-base">
            Prioridade *
          </label>
          <select
            id="prioridade"
            className="input-base"
            value={dados.prioridade}
            onChange={(e) =>
              setDados({ ...dados, prioridade: e.target.value as SolicitacaoCreateInput['prioridade'] })
            }
          >
            {PRIORIDADES.map((prioridade) => (
              <option key={prioridade} value={prioridade}>
                {prioridade}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="descricao" className="label-base">
          Descrição *
        </label>
        <textarea
          id="descricao"
          rows={3}
          className="input-base resize-none"
          value={dados.descricao}
          onChange={(e) => setDados({ ...dados, descricao: e.target.value })}
          aria-invalid={Boolean(erroDoCampo('descricao'))}
          required
        />
        <CampoErro mensagem={erroDoCampo('descricao')} />
      </div>

      {precisaJustificativa && (
        <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50/60 p-3">
          <label htmlFor="justificativa_prioridade" className="label-base flex items-center gap-1.5 text-rose-700">
            <AlertCircle size={15} />
            Justificativa da prioridade URGENTE *
          </label>
          <textarea
            id="justificativa_prioridade"
            rows={2}
            className="input-base resize-none"
            value={dados.justificativa_prioridade ?? ''}
            onChange={(e) => setDados({ ...dados, justificativa_prioridade: e.target.value })}
            aria-invalid={Boolean(erroDoCampo('justificativa_prioridade'))}
            required
          />
          <CampoErro mensagem={erroDoCampo('justificativa_prioridade')} />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary" disabled={enviando}>
          <Send size={16} />
          {enviando ? 'Enviando...' : 'Registrar solicitação'}
        </button>
        <button type="button" className="btn-secondary" onClick={limpar} disabled={enviando}>
          <X size={16} />
          Limpar
        </button>
      </div>
    </form>
  );
}
