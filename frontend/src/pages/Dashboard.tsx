import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Inbox,
  Loader2,
  RefreshCw,
  SearchX,
  XCircle,
} from 'lucide-react';
import { FiltrosSolicitacoes, type FiltrosState } from '../components/FiltrosSolicitacoes';
import { FormularioSolicitacao } from '../components/FormularioSolicitacao';
import { KpiCard } from '../components/KpiCard';
import { ModalDetalhesSolicitacao } from '../components/ModalDetalhesSolicitacao';
import { PrioridadeBadge } from '../components/PrioridadeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { normalizeApiError } from '../services/api';
import { solicitacaoService } from '../services/solicitacaoService';
import type {
  PaginationMeta,
  Solicitacao,
  SolicitacaoCreateInput,
  StatusSolicitacao,
} from '../types/solicitacao';

type EstadoCarregamento = 'ocioso' | 'carregando' | 'sucesso' | 'erro';

const KPI_CONFIG: { status: StatusSolicitacao; rotulo: string; Icone: typeof Inbox; cor: string }[] = [
  { status: 'RECEBIDA', rotulo: 'Recebidas', Icone: Inbox, cor: 'bg-blue-50 text-blue-600' },
  { status: 'EM_ANALISE', rotulo: 'Em análise', Icone: Clock, cor: 'bg-amber-50 text-amber-600' },
  { status: 'AGENDADA', rotulo: 'Agendadas', Icone: CalendarClock, cor: 'bg-indigo-50 text-indigo-600' },
  { status: 'CONCLUIDA', rotulo: 'Concluídas', Icone: CheckCircle2, cor: 'bg-emerald-50 text-emerald-600' },
  { status: 'CANCELADA', rotulo: 'Canceladas', Icone: XCircle, cor: 'bg-rose-50 text-rose-600' },
];

export function Dashboard() {
  const [filtros, setFiltros] = useState<FiltrosState>({ status: '', categoria: '', prioridade: '' });
  const [pagina, setPagina] = useState(1);

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [estado, setEstado] = useState<EstadoCarregamento>('ocioso');
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const [enviandoFormulario, setEnviandoFormulario] = useState(false);
  const [errosFormulario, setErrosFormulario] = useState<Record<string, string[]> | null>(null);

  const [selecionada, setSelecionada] = useState<Solicitacao | null>(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  const [erroStatus, setErroStatus] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setEstado('carregando');
    setMensagemErro(null);

    try {
      const resposta = await solicitacaoService.listar({
        status: filtros.status || undefined,
        categoria: filtros.categoria || undefined,
        prioridade: filtros.prioridade || undefined,
        page: pagina,
        per_page: 15,
      });

      setSolicitacoes(resposta.data);
      setMeta(resposta.meta);
      setEstado('sucesso');
    } catch (erro) {
      setMensagemErro(normalizeApiError(erro).message);
      setEstado('erro');
    }
  }, [filtros, pagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleMudarFiltros(novosFiltros: FiltrosState) {
    setFiltros(novosFiltros);
    setPagina(1);
  }

  async function handleCriar(dadosFormulario: SolicitacaoCreateInput) {
    setEnviandoFormulario(true);
    setErrosFormulario(null);

    try {
      await solicitacaoService.criar(dadosFormulario);
      setPagina(1);
      await carregar();
    } catch (erro) {
      const normalizado = normalizeApiError(erro);
      setErrosFormulario(normalizado.fieldErrors);
      if (!normalizado.fieldErrors) {
        setMensagemErro(normalizado.message);
      }
    } finally {
      setEnviandoFormulario(false);
    }
  }

  async function handleAtualizarStatus(id: string, novoStatus: StatusSolicitacao) {
    setAtualizandoStatus(true);
    setErroStatus(null);

    try {
      const resposta = await solicitacaoService.atualizarStatus(id, novoStatus);
      setSelecionada(resposta.data);
      await carregar();
    } catch (erro) {
      setErroStatus(normalizeApiError(erro).message);
    } finally {
      setAtualizandoStatus(false);
    }
  }

  const resumoPorStatus = solicitacoes.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-700 text-white shadow-soft">
          <Activity size={22} strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AtendSaúde</h1>
          <p className="text-sm text-slate-500">Registro e acompanhamento de Solicitações de Atendimento</p>
        </div>
      </header>

      <section
        className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        aria-label="Resumo da página atual por status"
      >
        {KPI_CONFIG.map(({ status, rotulo, Icone, cor }) => (
          <KpiCard key={status} rotulo={rotulo} valor={resumoPorStatus[status] ?? 0} Icone={Icone} corIcone={cor} />
        ))}
      </section>

      <section className="card mb-8 border-l-4 border-l-primary-600 p-6">
        <h2 className="mb-4 text-lg font-bold">Nova solicitação</h2>
        <FormularioSolicitacao
          aoSubmeter={handleCriar}
          enviando={enviandoFormulario}
          errosPorCampo={errosFormulario}
        />
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-bold">Solicitações</h2>

        <FiltrosSolicitacoes filtros={filtros} onChange={handleMudarFiltros} />

        {estado === 'carregando' && (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Carregando solicitações...
          </div>
        )}

        {estado === 'erro' && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-medium text-rose-600">{mensagemErro}</p>
            <button type="button" className="btn-secondary" onClick={carregar}>
              <RefreshCw size={15} />
              Tentar novamente
            </button>
          </div>
        )}

        {estado === 'sucesso' && solicitacoes.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-slate-400">
            <SearchX size={28} />
            <p className="text-sm">Nenhuma solicitação encontrada para os filtros selecionados.</p>
          </div>
        )}

        {estado === 'sucesso' && solicitacoes.length > 0 && (
          <>
            <div className="-mx-6 overflow-x-auto px-6">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    <th className="py-2.5 pr-4">Protocolo</th>
                    <th className="py-2.5 pr-4">Solicitante</th>
                    <th className="py-2.5 pr-4">Categoria</th>
                    <th className="py-2.5 pr-4">Prioridade</th>
                    <th className="py-2.5 pr-4">Status</th>
                    <th className="py-2.5" aria-label="Ações" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {solicitacoes.map((solicitacao) => (
                    <tr key={solicitacao.id} className="transition hover:bg-slate-50">
                      <td className="py-3 pr-4 font-mono text-xs text-slate-500">{solicitacao.protocolo}</td>
                      <td className="py-3 pr-4 font-medium text-slate-800">{solicitacao.nome_solicitante}</td>
                      <td className="py-3 pr-4 text-slate-600">{solicitacao.categoria}</td>
                      <td className="py-3 pr-4">
                        <PrioridadeBadge prioridade={solicitacao.prioridade} />
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={solicitacao.status} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          className="btn-link text-xs"
                          onClick={() => setSelecionada(solicitacao)}
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.last_page > 1 && (
              <nav
                className="mt-5 flex items-center justify-center gap-3 border-t border-slate-100 pt-4"
                aria-label="Paginação"
              >
                <button
                  type="button"
                  className="btn-secondary px-3 py-1.5"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  <ChevronLeft size={15} />
                  Anterior
                </button>
                <span className="text-sm text-slate-500">
                  Página {meta.current_page} de {meta.last_page}
                </span>
                <button
                  type="button"
                  className="btn-secondary px-3 py-1.5"
                  disabled={pagina >= meta.last_page}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
                  <ChevronRight size={15} />
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      {selecionada && (
        <ModalDetalhesSolicitacao
          solicitacao={selecionada}
          aoFechar={() => {
            setSelecionada(null);
            setErroStatus(null);
          }}
          aoAtualizarStatus={handleAtualizarStatus}
          atualizando={atualizandoStatus}
          erro={erroStatus}
        />
      )}
    </main>
  );
}
