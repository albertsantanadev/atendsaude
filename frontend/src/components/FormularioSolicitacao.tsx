import { useState, type FormEvent } from 'react';
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
    <form className="formulario" onSubmit={handleSubmit} noValidate>
      <div className="formulario__campo">
        <label htmlFor="nome_solicitante">Nome do solicitante *</label>
        <input
          id="nome_solicitante"
          type="text"
          maxLength={150}
          value={dados.nome_solicitante}
          onChange={(e) => setDados({ ...dados, nome_solicitante: e.target.value })}
          aria-invalid={Boolean(erroDoCampo('nome_solicitante'))}
          required
        />
        {erroDoCampo('nome_solicitante') && <span className="formulario__erro">{erroDoCampo('nome_solicitante')}</span>}
      </div>

      <div className="formulario__linha">
        <div className="formulario__campo">
          <label htmlFor="categoria">Categoria *</label>
          <select
            id="categoria"
            value={dados.categoria}
            onChange={(e) => setDados({ ...dados, categoria: e.target.value as SolicitacaoCreateInput['categoria'] })}
          >
            {CATEGORIAS.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </select>
        </div>

        <div className="formulario__campo">
          <label htmlFor="prioridade">Prioridade *</label>
          <select
            id="prioridade"
            value={dados.prioridade}
            onChange={(e) => setDados({ ...dados, prioridade: e.target.value as SolicitacaoCreateInput['prioridade'] })}
          >
            {PRIORIDADES.map((prioridade) => <option key={prioridade} value={prioridade}>{prioridade}</option>)}
          </select>
        </div>
      </div>

      <div className="formulario__campo">
        <label htmlFor="descricao">Descrição *</label>
        <textarea
          id="descricao"
          rows={3}
          value={dados.descricao}
          onChange={(e) => setDados({ ...dados, descricao: e.target.value })}
          aria-invalid={Boolean(erroDoCampo('descricao'))}
          required
        />
        {erroDoCampo('descricao') && <span className="formulario__erro">{erroDoCampo('descricao')}</span>}
      </div>

      {precisaJustificativa && (
        <div className="formulario__campo">
          <label htmlFor="justificativa_prioridade">Justificativa da prioridade URGENTE *</label>
          <textarea
            id="justificativa_prioridade"
            rows={2}
            value={dados.justificativa_prioridade ?? ''}
            onChange={(e) => setDados({ ...dados, justificativa_prioridade: e.target.value })}
            aria-invalid={Boolean(erroDoCampo('justificativa_prioridade'))}
            required
          />
          {erroDoCampo('justificativa_prioridade') && (
            <span className="formulario__erro">{erroDoCampo('justificativa_prioridade')}</span>
          )}
        </div>
      )}

      <div className="formulario__acoes">
        <button type="submit" className="botao botao--primario" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Registrar solicitação'}
        </button>
        <button type="button" className="botao botao--secundario" onClick={limpar} disabled={enviando}>
          Limpar
        </button>
      </div>
    </form>
  );
}