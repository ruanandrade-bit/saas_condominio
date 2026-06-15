import React from 'react';
import { Menu, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuClick, actions }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-xl sm:px-7 sm:py-4">
      <div className="mx-auto flex max-w-[1600px] flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="icon-button shrink-0 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="mb-0.5 hidden items-center gap-1.5 sm:flex">
              <Sparkles className="h-3 w-3 text-blue-500" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-600">Visão operacional</p>
            </div>
            <h1 className="truncate text-lg font-extrabold tracking-[-0.035em] text-slate-950 sm:text-xl">{title}</h1>
            {subtitle && <p className="mt-0.5 hidden truncate text-xs font-medium text-slate-500 sm:block">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center justify-end gap-2">{actions}</div>}
      </div>
    </header>
  );
};

export default Header;
