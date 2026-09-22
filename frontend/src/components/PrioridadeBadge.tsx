import { AlertTriangle, ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react';
import type { PrioridadeSolicitacao } from '../types/solicitacao';

interface PrioridadeConfig {
  classe: string;
  Icone: LucideIcon;
}

const CONFIG: Record<PrioridadeSolicitacao, PrioridadeConfig> = {
  BAIXA: { classe: 'bg-slate-100 text-slate-600', Icone: ArrowDown },
  MEDIA: { classe: 'bg-blue-50 text-blue-700', Icone: Minus },
  ALTA: { classe: 'bg-orange-50 text-orange-700', Icone: ArrowUp },
  URGENTE: { classe: 'bg-rose-50 text-rose-700', Icone: AlertTriangle },
};

function rotular(prioridade: PrioridadeSolicitacao): string {
  return prioridade.charAt(0) + prioridade.slice(1).toLowerCase();
}

export function PrioridadeBadge({ prioridade }: { prioridade: PrioridadeSolicitacao }) {
  const { classe, Icone } = CONFIG[prioridade];

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${classe}`}
    >
      <Icone size={12} strokeWidth={2.5} />
      {rotular(prioridade)}
    </span>
  );
}
