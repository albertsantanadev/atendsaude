import type { ChangeEvent } from 'react';
import {
  CATEGORIAS,
  PRIORIDADES,
  STATUS,
  type CategoriaSolicitacao,
  type PrioridadeSolicitacao,
  type StatusSolicitacao,
} from '../types/solicitacao';

export interface FiltrosState {
  status: StatusSolicitacao | '';
  categoria: CategoriaSolicitacao | '';
  prioridade: PrioridadeSolicitacao | '';
}

interface Props {
  filtros: FiltrosState;
  onChange: (filtros: FiltrosState) => void;
}

const ROTULO_STATUS: Record<StatusSolicitacao, string> = {
  RECEBIDA: 'Recebida',
  EM_ANALISE: 'Em análise',
  AGENDADA: 'Agendada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

export function FiltrosSolicitacoes({ filtros, onChange }: Props) {
  function handleChange(campo: keyof FiltrosState) {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...filtros, [campo]: event.target.value });
    };
  }

  function limpar() {
    onChange({ status: '', categoria: '', prioridade: '' });
  }

  return (
    <div className="filtros" role="search" aria-label="Filtros de solicitações">
      <div className="filtros__campo">
        <label htmlFor="filtro-status">Status</label>
        <select id="filtro-status" value={filtros.status} onChange={handleChange('status')}>
          <option value="">Todos</option>
          {STATUS.map((status) => (
            <option key={status} value={status}>{ROTULO_STATUS[status]}</option>
          ))}
        </select>
      </div>

      <div className="filtros__campo">
        <label htmlFor="filtro-categoria">Categoria</label>
        <select id="filtro-categoria" value={filtros.categoria} onChange={handleChange('categoria')}>
          <option value="">Todas</option>
          {CATEGORIAS.map((categoria) => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>
      </div>

      <div className="filtros__campo">
        <label htmlFor="filtro-prioridade">Prioridade</label>
        <select id="filtro-prioridade" value={filtros.prioridade} onChange={handleChange('prioridade')}>
          <option value="">Todas</option>
          {PRIORIDADES.map((prioridade) => (
            <option key={prioridade} value={prioridade}>{prioridade}</option>
          ))}
        </select>
      </div>

      <button type="button" className="botao botao--secundario" onClick={limpar}>
        Limpar filtros
      </button>
    </div>
  );
}