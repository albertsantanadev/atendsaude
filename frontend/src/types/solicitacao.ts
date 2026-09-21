export type CategoriaSolicitacao = 'CONSULTA' | 'EXAME' | 'VACINACAO' | 'OUTRO';
export type PrioridadeSolicitacao = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type StatusSolicitacao = 'RECEBIDA' | 'EM_ANALISE' | 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA';

export const CATEGORIAS: CategoriaSolicitacao[] = ['CONSULTA', 'EXAME', 'VACINACAO', 'OUTRO'];
export const PRIORIDADES: PrioridadeSolicitacao[] = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'];
export const STATUS: StatusSolicitacao[] = ['RECEBIDA', 'EM_ANALISE', 'AGENDADA', 'CONCLUIDA', 'CANCELADA'];

export const TRANSICOES_PERMITIDAS: Record<StatusSolicitacao, StatusSolicitacao[]> = {
  RECEBIDA: ['EM_ANALISE', 'CANCELADA'],
  EM_ANALISE: ['AGENDADA', 'CANCELADA'],
  AGENDADA: ['CONCLUIDA', 'CANCELADA'],
  CONCLUIDA: [],
  CANCELADA: [],
};

export interface Solicitacao {
  id: string;
  protocolo: string;
  nome_solicitante: string;
  categoria: CategoriaSolicitacao;
  prioridade: PrioridadeSolicitacao;
  status: StatusSolicitacao;
  descricao: string;
  justificativa_prioridade: string | null;
  data_criacao: string;
  data_atualizacao: string;
}

export interface SolicitacaoCreateInput {
  nome_solicitante: string;
  categoria: CategoriaSolicitacao;
  prioridade: PrioridadeSolicitacao;
  descricao: string;
  justificativa_prioridade?: string | null;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface SolicitacaoEnvelope {
  data: Solicitacao;
}

export interface SolicitacaoListEnvelope {
  data: Solicitacao[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface FiltrosSolicitacao {
  status?: StatusSolicitacao;
  categoria?: CategoriaSolicitacao;
  prioridade?: PrioridadeSolicitacao;
  page?: number;
  per_page?: number;
}