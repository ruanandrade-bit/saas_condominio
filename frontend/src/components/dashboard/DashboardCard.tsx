import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'slate';
  subtitle?: string;
}

const colorMap: Record<string, { bg: string; icon: string; text: string; line: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-700', line: 'bg-blue-500' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-700', line: 'bg-emerald-500' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-700', line: 'bg-red-500' },
  yellow: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-700', line: 'bg-amber-500' },
  purple: { bg: 'bg-violet-50', icon: 'text-violet-600', text: 'text-violet-700', line: 'bg-violet-500' },
  slate: { bg: 'bg-slate-100', icon: 'text-slate-600', text: 'text-slate-800', line: 'bg-slate-500' },
};

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, subtitle }) => {
  const c = colorMap[color];

  return (
    <div className="group relative animate-fade-in overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${c.line}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500">{title}</p>
          <p className={`mt-2 truncate text-2xl font-extrabold tracking-[-0.045em] ${c.text}`}>{value}</p>
          {subtitle && <p className="mt-1.5 text-xs font-medium text-slate-400">{subtitle}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${c.bg} ${c.icon} ring-1 ring-current/5 transition-transform duration-300 group-hover:scale-105`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
