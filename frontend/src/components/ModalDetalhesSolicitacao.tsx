import { useState } from 'react';
import { ArrowRight, Ban, X } from 'lucide-react';
import { TRANSICOES_PERMITIDAS, type Solicitacao, type StatusSolicitacao } from '../types/solicitacao';
import { PrioridadeBadge } from './PrioridadeBadge';
import { STATUS_CONFIG, StatusBadge } from './StatusBadge';

interface Props {
  solicitacao: Solicitacao;
  aoFechar: () => void;
  aoAtualizarStatus: (id: string, novoStatus: StatusSolicitacao) => Promise<void>;
  atualizando: boolean;
  erro: string | null;
}

function LinhaDetalhe({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-slate-500">{rotulo}</dt>
      <dd className="text-right text-sm font-medium text-slate-800">{children}</dd>
    </div>
  );
}

export function ModalDetalhesSolicitacao({
  solicitacao,
  aoFechar,
  aoAtualizarStatus,
  atualizando,
  erro,
}: Props) {
  const [novoStatus, setNovoStatus] = useState<StatusSolicitacao | ''>('');
  const opcoes = TRANSICOES_PERMITIDAS[solicitacao.status];

  async function confirmar() {
    if (!novoStatus) return;
    await aoAtualizarStatus(solicitacao.id, novoStatus);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <header className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Solicitação</p>
            <h2 id="modal-titulo" className="font-display text-lg font-bold text-slate-900">
              {solicitacao.protocolo}
            </h2>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </header>

        <dl className="divide-y divide-slate-100 border-y border-slate-100">
          <LinhaDetalhe rotulo="Solicitante">{solicitacao.nome_solicitante}</LinhaDetalhe>
          <LinhaDetalhe rotulo="Categoria">{solicitacao.categoria}</LinhaDetalhe>
          <LinhaDetalhe rotulo="Prioridade">
            <PrioridadeBadge prioridade={solicitacao.prioridade} />
          </LinhaDetalhe>
          <LinhaDetalhe rotulo="Status atual">
            <StatusBadge status={solicitacao.status} />
          </LinhaDetalhe>
        </dl>

        <div className="py-3">
          <p className="mb-1 text-sm text-slate-500">Descrição</p>
          <p className="text-sm text-slate-800">{solicitacao.descricao}</p>
        </div>

        {solicitacao.justificativa_prioridade && (
          <div className="mb-3 rounded-xl bg-rose-50/60 p-3">
            <p className="mb-1 text-sm font-medium text-rose-700">Justificativa da prioridade</p>
            <p className="text-sm text-rose-900">{solicitacao.justificativa_prioridade}</p>
          </div>
        )}

        <p className="mb-4 text-xs text-slate-400">
          Criada em {new Date(solicitacao.data_criacao).toLocaleString('pt-BR')} · Atualizada em{' '}
          {new Date(solicitacao.data_atualizacao).toLocaleString('pt-BR')}
        </p>

        <section className="border-t border-slate-100 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Atualizar status</h3>
          {opcoes.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
              <Ban size={16} />
              Status final — não pode mais ser alterado.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Novo status"
                className="input-base flex-1"
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value as StatusSolicitacao)}
              >
                <option value="">Selecione...</option>
                {opcoes.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_CONFIG[status].rotulo}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-primary"
                onClick={confirmar}
                disabled={!novoStatus || atualizando}
              >
                {atualizando ? 'Atualizando...' : 'Confirmar'}
                {!atualizando && <ArrowRight size={16} />}
              </button>
            </div>
          )}
          {erro && <p className="mt-2 text-sm font-medium text-rose-600">{erro}</p>}
        </section>
      </div>
    </div>
  );
}
