import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, getUnitLabel } from '../../utils/helpers';
import api from '../../services/api';
import { Reservation } from '../../types';
import toast from 'react-hot-toast';

const ReservationsPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await api.get('/reservations'); setList(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    try { await api.patch(`/reservations/${id}/approve`); toast.success('Aprovada!'); load(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
  };
  const reject = async (id: string) => {
    try { await api.patch(`/reservations/${id}/reject`); toast.success('Recusada!'); load(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
  };

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Reservas" subtitle={`${list.length} reservas`} onMenuClick={onMenuClick} />
      <div className="p-4 sm:p-6 animate-fade-in">
        {list.length === 0 ? (
          <EmptyState icon={<CalendarDays className="w-8 h-8" />} title="Nenhuma reserva" description="Nenhuma reserva pendente." />
        ) : (
          <div className="space-y-3">
            {list.map((r) => (
              <div key={r._id} className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{r.area}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {getUnitLabel(r.unitId)} • {formatDate(r.date)} • {r.startTime} - {r.endTime}
                    </p>
                    {r.notes && <p className="text-sm text-slate-600 mt-1">{r.notes}</p>}
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="success" onClick={() => approve(r._id)} icon={<CheckCircle className="w-3.5 h-3.5" />}>Aprovar</Button>
                      <Button size="sm" variant="danger" onClick={() => reject(r._id)} icon={<XCircle className="w-3.5 h-3.5" />}>Recusar</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ReservationsPage;
