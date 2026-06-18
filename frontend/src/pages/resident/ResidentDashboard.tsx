import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DashboardCard from '../../components/dashboard/DashboardCard';
import DashboardPanel from '../../components/dashboard/DashboardPanel';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Receipt, Megaphone, AlertTriangle, CalendarDays, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { ResidentDashboard as DashData } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';

const ResidentDashboard: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await api.get('/dashboard/resident'); setData(data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Meu Painel" subtitle="Bem-vindo ao Condomínio em Dia" onMenuClick={onMenuClick} />
      <div className="animate-fade-in space-y-6 p-4 sm:p-6">
        <section className="premium-hero relative overflow-hidden rounded-lg px-6 py-7 text-white shadow-xl shadow-blue-900/10 sm:px-8">
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-blue-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Área do morador
            </div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Sua rotina condominial, sem complicação.</h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-blue-100/75">
              Consulte cobranças, acompanhe ocorrências e organize suas reservas em um único lugar.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Cobranças pendentes" value={data?.stats.pendingCharges || 0} icon={<Receipt className="w-5 h-5" />} color="yellow" />
          <DashboardCard title="Comunicados" value={data?.stats.recentAnnouncements || 0} icon={<Megaphone className="w-5 h-5" />} color="blue" />
          <DashboardCard title="Ocorrências abertas" value={data?.stats.openIssues || 0} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
          <DashboardCard title="Próximas reservas" value={data?.stats.upcomingReservations || 0} icon={<CalendarDays className="w-5 h-5" />} color="purple" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <DashboardPanel title="Próximas cobranças" subtitle="Valores pendentes da sua unidade" icon={<Receipt className="h-4 w-4" />}>
            {data?.pendingCharges?.length ? data.pendingCharges.map((charge) => (
              <div key={charge._id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{charge.description}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">Vence em {formatDate(charge.dueDate)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="mb-1.5 text-sm font-extrabold text-slate-950">{formatCurrency(charge.amount)}</p>
                  <StatusBadge status={charge.status} />
                </div>
              </div>
            )) : (
              <div className="flex min-h-32 flex-col items-center justify-center px-5 py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">Nenhuma cobrança pendente</p>
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel title="Próximas reservas" subtitle="Agenda da sua unidade" icon={<CalendarDays className="h-4 w-4" />}>
            {data?.upcomingReservations?.length ? data.upcomingReservations.map((reservation) => (
              <div key={reservation._id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{reservation.area}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{formatDate(reservation.date)} · {reservation.startTime}–{reservation.endTime}</p>
                </div>
                <StatusBadge status={reservation.status} />
              </div>
            )) : (
              <div className="flex min-h-32 flex-col items-center justify-center px-5 py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">Nenhuma reserva agendada</p>
              </div>
            )}
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
};
export default ResidentDashboard;
