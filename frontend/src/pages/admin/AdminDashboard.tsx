import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DashboardCard from '../../components/dashboard/DashboardCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  AlertCircle, AlertTriangle, ArrowUpRight, CalendarDays, CheckCircle2,
  DollarSign, Home, Megaphone, TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatDate, getUnitLabel } from '../../utils/helpers';
import api from '../../services/api';
import { AdminDashboard as DashboardData } from '../../types';

const AdminDashboard: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Carregando dashboard..." />;

  return (
    <div>
      <Header title="Dashboard" subtitle="Visão geral do seu condomínio" onMenuClick={onMenuClick} />
      <div className="animate-fade-in space-y-6 p-4 sm:p-6">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-600/25 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-extrabold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Operação centralizada
              </div>
              <h2 className="max-w-2xl text-2xl font-extrabold tracking-[-0.045em] sm:text-3xl">
                Tudo o que importa, em uma visão clara.
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-400">
                Acompanhe financeiro, unidades e solicitações sem perder tempo alternando entre planilhas e mensagens.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unidades</p>
                <p className="mt-1 text-xl font-extrabold">{data?.stats.totalUnits || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pendências</p>
                <p className="mt-1 text-xl font-extrabold">{(data?.stats.openIssues || 0) + (data?.stats.pendingReservations || 0)}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardCard title="Recebido no mês" value={formatCurrency(data?.stats.receivedThisMonth || 0)} icon={<DollarSign className="w-5 h-5" />} color="green" />
          <DashboardCard title="A receber" value={formatCurrency(data?.stats.toReceive || 0)} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
          <DashboardCard title="Em atraso" value={formatCurrency(data?.stats.late || 0)} icon={<AlertCircle className="w-5 h-5" />} color="red" />
          <DashboardCard title="Unidades" value={data?.stats.totalUnits || 0} icon={<Home className="w-5 h-5" />} color="slate" />
          <DashboardCard title="Ocorrências" value={data?.stats.openIssues || 0} icon={<AlertTriangle className="w-5 h-5" />} color="yellow" />
          <DashboardCard title="Reservas" value={data?.stats.pendingReservations || 0} icon={<CalendarDays className="w-5 h-5" />} color="purple" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <DashboardPanel title="Cobranças atrasadas" subtitle="Valores que precisam de atenção" icon={<DollarSign className="h-4 w-4" />}>
              {data?.lateCharges && data.lateCharges.length > 0 ? (
                data.lateCharges.slice(0, 5).map((charge) => (
                  <div key={charge._id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{getUnitLabel(charge.unitId)}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">Vencimento em {formatDate(charge.dueDate)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="mb-1.5 text-sm font-extrabold text-red-600">{formatCurrency(charge.amount)}</p>
                      <StatusBadge status="late" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex min-h-36 flex-col items-center justify-center px-5 py-8 text-center">
                  <CheckCircle2 className="mb-3 h-7 w-7 text-emerald-500" />
                  <p className="text-sm font-bold text-slate-700">Nenhuma cobrança atrasada</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">O financeiro está em dia por aqui.</p>
                </div>
              )}
          </DashboardPanel>

          <DashboardPanel title="Últimas ocorrências" subtitle="Solicitações abertas recentemente" icon={<AlertTriangle className="h-4 w-4" />}>
              {data?.recentIssues && data.recentIssues.length > 0 ? (
                data.recentIssues.slice(0, 5).map((issue) => (
                  <div key={issue._id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{issue.title}</p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-500">{getUnitLabel(issue.unitId)} · {formatDate(issue.createdAt)}</p>
                    </div>
                    <StatusBadge status={issue.status} />
                  </div>
                ))
              ) : (
                <div className="flex min-h-36 flex-col items-center justify-center px-5 py-8 text-center">
                  <CheckCircle2 className="mb-3 h-7 w-7 text-emerald-500" />
                  <p className="text-sm font-bold text-slate-700">Nenhuma ocorrência aberta</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">As solicitações estão sob controle.</p>
                </div>
              )}
          </DashboardPanel>

          <DashboardPanel title="Reservas pendentes" subtitle="Solicitações aguardando análise" icon={<CalendarDays className="h-4 w-4" />}>
              {data?.upcomingReservations && data.upcomingReservations.length > 0 ? (
                data.upcomingReservations.map((r) => (
                  <div key={r._id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{r.area}</p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-500">{getUnitLabel(r.unitId)} · {formatDate(r.date)} · {r.startTime}–{r.endTime}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))
              ) : (
                <div className="flex min-h-36 flex-col items-center justify-center px-5 py-8 text-center">
                  <CalendarDays className="mb-3 h-7 w-7 text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">Nenhuma reserva pendente</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">Novas solicitações aparecerão aqui.</p>
                </div>
              )}
          </DashboardPanel>

          <DashboardPanel title="Últimos comunicados" subtitle="Publicações recentes do condomínio" icon={<Megaphone className="h-4 w-4" />}>
              {data?.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
                data.recentAnnouncements.map((a) => (
                  <div key={a._id} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/70">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-900">{a.title}</p>
                        {a.isPinned && <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">Fixado</span>}
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">{formatDate(a.createdAt)}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                ))
              ) : (
                <div className="flex min-h-36 flex-col items-center justify-center px-5 py-8 text-center">
                  <Megaphone className="mb-3 h-7 w-7 text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">Nenhum comunicado recente</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">Suas publicações aparecerão aqui.</p>
                </div>
              )}
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
