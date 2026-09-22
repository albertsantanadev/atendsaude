import type { LucideIcon } from 'lucide-react';

interface Props {
  rotulo: string;
  valor: number;
  Icone: LucideIcon;
  corIcone: string;
}

export function KpiCard({ rotulo, valor, Icone, corIcone }: Props) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-soft backdrop-blur-md transition hover:bg-white/90">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-bold text-slate-900">{valor}</p>
          <p className="text-sm text-slate-500">{rotulo}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${corIcone}`}>
          <Icone size={20} strokeWidth={2.25} />
        </div>
      </div>
    </div>
  );
}
