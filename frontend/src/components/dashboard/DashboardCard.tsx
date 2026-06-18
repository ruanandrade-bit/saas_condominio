import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'purple' | 'pink' | 'slate';
  subtitle?: string;
}

const colorMap: Record<string, { bg: string; icon: string; text: string; line: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-700', line: 'bg-blue-500' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-700', line: 'bg-emerald-500' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-700', line: 'bg-red-500' },
  yellow: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-700', line: 'bg-amber-500' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-700', line: 'bg-orange-500' },
  purple: { bg: 'bg-violet-50', icon: 'text-violet-600', text: 'text-violet-700', line: 'bg-violet-500' },
  pink: { bg: 'bg-fuchsia-50', icon: 'text-fuchsia-600', text: 'text-fuchsia-700', line: 'bg-fuchsia-500' },
  slate: { bg: 'bg-slate-100', icon: 'text-slate-600', text: 'text-slate-800', line: 'bg-slate-500' },
};

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, subtitle }) => {
  const c = colorMap[color];

  return (
    <div className="group relative flex min-h-[118px] items-center justify-between overflow-hidden rounded-lg border border-slate-200/80 bg-white/95 p-5 shadow-soft backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-elevated">
      <div className={`absolute inset-x-0 top-0 h-1 ${c.line}`} />
      <div className="flex min-w-0 items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.icon} ring-1 ring-current/5 transition-transform duration-300 group-hover:scale-105`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500">{title}</p>
          <p className={`mt-1 truncate text-xl font-extrabold ${c.text}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className={`hidden h-8 w-20 shrink-0 opacity-60 transition-opacity group-hover:opacity-100 sm:block ${c.icon}`} aria-hidden="true">
        <svg viewBox="0 0 100 30" className="h-full w-full fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0,20 Q10,5 20,15 T40,20 T60,10 T80,25 T100,5" />
        </svg>
      </div>
    </div>
  );
};

export default DashboardCard;
