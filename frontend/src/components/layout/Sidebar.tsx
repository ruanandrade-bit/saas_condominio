import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Building2, Home, Users, Receipt, Megaphone,
  AlertTriangle, CalendarDays, LogOut, X, ChevronRight,
} from 'lucide-react';
import BrandMark from '../ui/BrandMark';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/condominio', icon: Building2, label: 'Condomínio' },
    { to: '/unidades', icon: Home, label: 'Unidades' },
    { to: '/moradores', icon: Users, label: 'Moradores' },
    { to: '/cobrancas', icon: Receipt, label: 'Cobranças' },
    { to: '/comunicados', icon: Megaphone, label: 'Comunicados' },
    { to: '/ocorrencias', icon: AlertTriangle, label: 'Ocorrências' },
    { to: '/reservas', icon: CalendarDays, label: 'Reservas' },
  ];

  const residentLinks = [
    { to: '/morador', icon: LayoutDashboard, label: 'Painel' },
    { to: '/morador/cobrancas', icon: Receipt, label: 'Minhas Cobranças' },
    { to: '/morador/comunicados', icon: Megaphone, label: 'Comunicados' },
    { to: '/morador/ocorrencias', icon: AlertTriangle, label: 'Ocorrências' },
    { to: '/morador/reservas', icon: CalendarDays, label: 'Reservas' },
  ];

  const links = isAdmin ? adminLinks : residentLinks;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-200 ${
      isActive
        ? 'bg-white text-slate-950 shadow-lg shadow-slate-950/10'
        : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col overflow-hidden bg-slate-950 text-white shadow-2xl shadow-slate-950/20 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full lg:visible'
        }`}
      >
        <div className="absolute -right-20 top-10 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-5">
          <BrandMark inverted />
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Fechar menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative px-5 pb-3 pt-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
            {isAdmin ? 'Administração' : 'Área do morador'}
          </p>
        </div>

        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 pb-5">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={linkClass} onClick={onClose}>
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                    <link.icon className="h-[17px] w-[17px]" strokeWidth={2} />
                  </span>
                  <span className="flex-1">{link.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 text-slate-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-950/30">
                <span className="text-sm font-extrabold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{user?.name}</p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">{isAdmin ? 'Síndico administrador' : 'Morador'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Encerrar sessão
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
