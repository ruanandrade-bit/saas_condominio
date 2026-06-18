import React, { useEffect, useState } from 'react';
import { Bell, Menu, Sparkles, X } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuClick, actions }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!notificationsOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotificationsOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/[0.88] px-4 py-3 shadow-sm shadow-slate-950/[0.025] backdrop-blur-xl sm:px-7 sm:py-4">
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
              <div className="mb-1 hidden items-center gap-1.5 sm:flex">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-700">Visão operacional</p>
              </div>
              <h1 className="truncate text-lg font-extrabold text-slate-950 sm:text-xl">{title}</h1>
              {subtitle && <p className="mt-0.5 hidden truncate text-xs font-medium text-slate-500 sm:block">{subtitle}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3">
            {actions}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-800 hover:shadow-md"
              title="Notificações"
              aria-label="Abrir notificações"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
          </div>
        </div>
      </header>

      {notificationsOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="Notificações">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/72 backdrop-blur-[7px]"
            onClick={() => setNotificationsOpen(false)}
            aria-label="Fechar notificações"
          />

          <section className="relative w-full max-w-[496px] animate-scale-in overflow-hidden rounded-lg border border-slate-700/80 bg-[#1b2638] text-white shadow-[0_28px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-700/70 px-7 py-7">
              <div>
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white">Notificações</h2>
                    <p className="mt-1 text-sm font-medium text-slate-400">Nenhuma notificação</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setNotificationsOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700/55 text-slate-300 transition-colors hover:bg-slate-600/70 hover:text-white" aria-label="Fechar notificações">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-[262px] flex-col items-center justify-center px-8 py-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-slate-700/35 text-slate-500 ring-1 ring-white/5">
                <Bell className="h-8 w-8" />
              </div>
              <p className="text-base font-extrabold text-slate-400">Sem notificações</p>
              <p className="mt-2 text-sm font-medium text-slate-500">As notificações aparecerão aqui</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default Header;
