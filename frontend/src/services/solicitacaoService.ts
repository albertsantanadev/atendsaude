import { api } from './api';
import type {
  FiltrosSolicitacao,
  SolicitacaoCreateInput,
  SolicitacaoEnvelope,
  SolicitacaoListEnvelope,
  StatusSolicitacao,
} from '../types/solicitacao';

export const solicitacaoService = {
  async listar(filtros: FiltrosSolicitacao = {}): Promise<SolicitacaoListEnvelope> {
    const { data } = await api.get<SolicitacaoListEnvelope>('/solicitacoes', { params: filtros });
    return data;
  },

  async consultar(id: string): Promise<SolicitacaoEnvelope> {
    const { data } = await api.get<SolicitacaoEnvelope>(`/solicitacoes/${id}`);
    return data;
  },

  async criar(payload: SolicitacaoCreateInput): Promise<SolicitacaoEnvelope> {
    const { data } = await api.post<SolicitacaoEnvelope>('/solicitacoes', payload);
    return data;
  },

  async atualizarStatus(id: string, status: StatusSolicitacao): Promise<SolicitacaoEnvelope> {
    const { data } = await api.patch<SolicitacaoEnvelope>(`/solicitacoes/${id}/status`, { status });
    return data;
  },
};