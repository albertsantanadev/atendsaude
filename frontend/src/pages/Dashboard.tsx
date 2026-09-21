import { useCallback, useEffect, useState } from 'react';
import { FiltrosSolicitacoes, type FiltrosState } from '../components/FiltrosSolicitacoes';
import { FormularioSolicitacao } from '../components/FormularioSolicitacao';
import { ModalDetalhesSolicitacao } from '../components/ModalDetalhesSolicitacao';
import { normalizeApiError } from '../services/api';
import { solicitacaoService } from '../services/solicitacaoService';
import type {
  PaginationMeta,
  Solicitacao,
  SolicitacaoCreateInput,
  StatusSolicitacao,
} from '../types/solicitacao';

type EstadoCarregamento = 'ocioso' | 'carregando' | 'sucesso' | 'erro';

const ROTULO_STATUS: Record<StatusSolicitacao, string> = {
  RECEBIDA: 'Recebida',
  EM_ANALISE: 'Em análise',
  AGENDADA: 'Agendada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

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
    <main className="dashboard">
      <header className="dashboard__cabecalho">
        <h1>AtendSaúde</h1>
        <p>Registro e acompanhamento de Solicitações de Atendimento</p>
      </header>

      <section className="dashboard__resumo" aria-label="Resumo da página atual por status">
        {Object.entries(ROTULO_STATUS).map(([status, rotulo]) => (
          <div key={status} className={`resumo-card resumo-card--${status.toLowerCase()}`}>
            <span className="resumo-card__valor">{resumoPorStatus[status] ?? 0}</span>
            <span className="resumo-card__rotulo">{rotulo}</span>
          </div>
        ))}
      </section>

      <section className="dashboard__nova-solicitacao">
        <h2>Nova solicitação</h2>
        <FormularioSolicitacao
          aoSubmeter={handleCriar}
          enviando={enviandoFormulario}
          errosPorCampo={errosFormulario}
        />
      </section>

      <section className="dashboard__lista">
        <h2>Solicitações</h2>

        <FiltrosSolicitacoes filtros={filtros} onChange={handleMudarFiltros} />

        {estado === 'carregando' && <p className="estado estado--carregando">Carregando solicitações...</p>}

        {estado === 'erro' && (
          <div className="estado estado--erro">
            <p>{mensagemErro}</p>
            <button type="button" className="botao botao--secundario" onClick={carregar}>
              Tentar novamente
            </button>
          </div>
        )}

        {estado === 'sucesso' && solicitacoes.length === 0 && (
          <p className="estado estado--vazio">
            Nenhuma solicitação encontrada para os filtros selecionados.
          </p>
        )}

        {estado === 'sucesso' && solicitacoes.length > 0 && (
          <>
            <table className="tabela">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Solicitante</th>
                  <th>Categoria</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {solicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id}>
                    <td>{solicitacao.protocolo}</td>
                    <td>{solicitacao.nome_solicitante}</td>
                    <td>{solicitacao.categoria}</td>
                    <td>{solicitacao.prioridade}</td>
                    <td>
                      <span className={`badge badge--${solicitacao.status.toLowerCase()}`}>
                        {ROTULO_STATUS[solicitacao.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="botao botao--link"
                        onClick={() => setSelecionada(solicitacao)}
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {meta && meta.last_page > 1 && (
              <nav className="paginacao" aria-label="Paginação">
                <button type="button" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
                  Anterior
                </button>
                <span>
                  Página {meta.current_page} de {meta.last_page}
                </span>
                <button
                  type="button"
                  disabled={pagina >= meta.last_page}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
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
