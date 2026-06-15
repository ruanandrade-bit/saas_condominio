import { Building2 } from 'lucide-react';

interface BrandMarkProps {
  inverted?: boolean;
  compact?: boolean;
}

const BrandMark = ({ inverted = false, compact = false }: BrandMarkProps) => (
  <div className="flex items-center gap-3">
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-lg shadow-blue-950/20 ring-1 ring-white/20">
      <div className="absolute inset-x-2 top-0 h-px bg-white/70" />
      <Building2 className="relative h-5 w-5 text-white" strokeWidth={2.2} />
    </div>
    {!compact && (
      <div className="leading-none">
        <p className={`text-[15px] font-extrabold tracking-[-0.03em] ${inverted ? 'text-white' : 'text-slate-950'}`}>
          Condomínio
        </p>
        <p className={`mt-1 text-[11px] font-bold uppercase tracking-[0.16em] ${inverted ? 'text-blue-300' : 'text-blue-600'}`}>
          em Dia
        </p>
      </div>
    )}
  </div>
);

export default BrandMark;
