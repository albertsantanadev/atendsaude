import type { ChangeEvent } from 'react';
import { ListFilter, X } from 'lucide-react';
import {
  CATEGORIAS,
  PRIORIDADES,
  STATUS,
  type CategoriaSolicitacao,
  type PrioridadeSolicitacao,
  type StatusSolicitacao,
} from '../types/solicitacao';
import { STATUS_CONFIG } from './StatusBadge';

export interface FiltrosState {
  status: StatusSolicitacao | '';
  categoria: CategoriaSolicitacao | '';
  prioridade: PrioridadeSolicitacao | '';
}

interface Props {
  filtros: FiltrosState;
  onChange: (filtros: FiltrosState) => void;
}

export function FiltrosSolicitacoes({ filtros, onChange }: Props) {
  function handleChange(campo: keyof FiltrosState) {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...filtros, [campo]: event.target.value });
    };
  }

  function limpar() {
    onChange({ status: '', categoria: '', prioridade: '' });
  }

  const temFiltroAtivo = filtros.status || filtros.categoria || filtros.prioridade;

  return (
    <div className="mb-5 flex flex-wrap items-end gap-3" role="search" aria-label="Filtros de solicitações">
      <div className="flex items-center gap-1.5 pb-2 text-sm font-medium text-slate-500">
        <ListFilter size={16} />
        Filtrar por
      </div>

      <div>
        <label htmlFor="filtro-status" className="mb-1 block text-xs font-medium text-slate-500">
          Status
        </label>
        <select
          id="filtro-status"
          className="input-base min-w-[150px] py-1.5"
          value={filtros.status}
          onChange={handleChange('status')}
        >
          <option value="">Todos</option>
          {STATUS.map((status) => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].rotulo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-categoria" className="mb-1 block text-xs font-medium text-slate-500">
          Categoria
        </label>
        <select
          id="filtro-categoria"
          className="input-base min-w-[140px] py-1.5"
          value={filtros.categoria}
          onChange={handleChange('categoria')}
        >
          <option value="">Todas</option>
          {CATEGORIAS.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-prioridade" className="mb-1 block text-xs font-medium text-slate-500">
          Prioridade
        </label>
        <select
          id="filtro-prioridade"
          className="input-base min-w-[140px] py-1.5"
          value={filtros.prioridade}
          onChange={handleChange('prioridade')}
        >
          <option value="">Todas</option>
          {PRIORIDADES.map((prioridade) => (
            <option key={prioridade} value={prioridade}>
              {prioridade}
            </option>
          ))}
        </select>
      </div>

      {temFiltroAtivo && (
        <button type="button" className="btn-link flex items-center gap-1 pb-2 text-sm" onClick={limpar}>
          <X size={14} />
          Limpar filtros
        </button>
      )}
    </div>
  );
}
