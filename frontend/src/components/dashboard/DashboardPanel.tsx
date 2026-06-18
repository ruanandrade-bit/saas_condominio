import React from 'react';

interface DashboardPanelProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const DashboardPanel = ({ title, subtitle, icon, children }: DashboardPanelProps) => (
  <section className="surface-card overflow-hidden">
    <header className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/80">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-extrabold text-slate-950">{title}</h3>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{subtitle}</p>
      </div>
    </header>
    <div className="divide-y divide-slate-100">{children}</div>
  </section>
);

export default DashboardPanel;
