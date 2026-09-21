import { useState } from 'react';
import { TRANSICOES_PERMITIDAS, type Solicitacao, type StatusSolicitacao } from '../types/solicitacao';

interface Props {
  solicitacao: Solicitacao;
  aoFechar: () => void;
  aoAtualizarStatus: (id: string, novoStatus: StatusSolicitacao) => Promise<void>;
  atualizando: boolean;
  erro: string | null;
}

const ROTULO_STATUS: Record<StatusSolicitacao, string> = {
  RECEBIDA: 'Recebida',
  EM_ANALISE: 'Em análise',
  AGENDADA: 'Agendada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

export function ModalDetalhesSolicitacao({ solicitacao, aoFechar, aoAtualizarStatus, atualizando, erro }: Props) {
  const [novoStatus, setNovoStatus] = useState<StatusSolicitacao | ''>('');
  const opcoes = TRANSICOES_PERMITIDAS[solicitacao.status];

  async function confirmar() {
    if (!novoStatus) return;
    await aoAtualizarStatus(solicitacao.id, novoStatus);
  }

  return (
    <div className="modal__overlay" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className="modal">
        <header className="modal__cabecalho">
          <h2 id="modal-titulo">Solicitação {solicitacao.protocolo}</h2>
          <button type="button" className="modal__fechar" onClick={aoFechar} aria-label="Fechar">×</button>
        </header>

        <dl className="modal__detalhes">
          <dt>Solicitante</dt><dd>{solicitacao.nome_solicitante}</dd>
          <dt>Categoria</dt><dd>{solicitacao.categoria}</dd>
          <dt>Prioridade</dt><dd>{solicitacao.prioridade}</dd>
          <dt>Status atual</dt>
          <dd><span className={`badge badge--${solicitacao.status.toLowerCase()}`}>{ROTULO_STATUS[solicitacao.status]}</span></dd>
          <dt>Descrição</dt><dd>{solicitacao.descricao}</dd>
          {solicitacao.justificativa_prioridade && (
            <>
              <dt>Justificativa da prioridade</dt>
              <dd>{solicitacao.justificativa_prioridade}</dd>
            </>
          )}
          <dt>Criada em</dt><dd>{new Date(solicitacao.data_criacao).toLocaleString('pt-BR')}</dd>
          <dt>Atualizada em</dt><dd>{new Date(solicitacao.data_atualizacao).toLocaleString('pt-BR')}</dd>
        </dl>

        <section className="modal__transicao">
          <h3>Atualizar status</h3>
          {opcoes.length === 0 ? (
            <p className="modal__aviso">Esta solicitação está em um status final e não pode mais ser alterada.</p>
          ) : (
            <div className="modal__transicao-acoes">
              <select aria-label="Novo status" value={novoStatus} onChange={(e) => setNovoStatus(e.target.value as StatusSolicitacao)}>
                <option value="">Selecione...</option>
                {opcoes.map((status) => <option key={status} value={status}>{ROTULO_STATUS[status]}</option>)}
              </select>
              <button type="button" className="botao botao--primario" onClick={confirmar} disabled={!novoStatus || atualizando}>
                {atualizando ? 'Atualizando...' : 'Confirmar transição'}
              </button>
            </div>
          )}
          {erro && <p className="formulario__erro">{erro}</p>}
        </section>
      </div>
    </div>
  );
}