import { CalendarClock, CheckCircle2, Clock, Inbox, XCircle, type LucideIcon } from 'lucide-react';
import type { StatusSolicitacao } from '../types/solicitacao';

interface StatusConfig {
  rotulo: string;
  classe: string;
  Icone: LucideIcon;
}

export const STATUS_CONFIG: Record<StatusSolicitacao, StatusConfig> = {
  RECEBIDA: { rotulo: 'Recebida', classe: 'bg-blue-50 text-blue-700 ring-blue-600/20', Icone: Inbox },
  EM_ANALISE: { rotulo: 'Em análise', classe: 'bg-amber-50 text-amber-700 ring-amber-600/20', Icone: Clock },
  AGENDADA: {
    rotulo: 'Agendada',
    classe: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    Icone: CalendarClock,
  },
  CONCLUIDA: {
    rotulo: 'Concluída',
    classe: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Icone: CheckCircle2,
  },
  CANCELADA: { rotulo: 'Cancelada', classe: 'bg-rose-50 text-rose-700 ring-rose-600/20', Icone: XCircle },
};

export function StatusBadge({ status }: { status: StatusSolicitacao }) {
  const { rotulo, classe, Icone } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${classe}`}
    >
      <Icone size={13} strokeWidth={2.25} />
      {rotulo}
    </span>
  );
}
