import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, CalendarDays, XCircle } from 'lucide-react';
import { formatDate, COMMON_AREAS } from '../../utils/helpers';
import api from '../../services/api';
import { Reservation } from '../../types';
import toast from 'react-hot-toast';

const MyReservations: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ area: '', date: '', startTime: '', endTime: '', notes: '' });

  const load = async () => {
    try { const { data } = await api.get('/reservations'); setList(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.area || !form.date || !form.startTime || !form.endTime) { toast.error('Preencha os campos obrigatórios'); return; }
    setSaving(true);
    try {
      await api.post('/reservations', form);
      toast.success('Reserva solicitada!'); setModalOpen(false); load();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const cancel = async (id: string) => {
    try { await api.patch(`/reservations/${id}/cancel`); toast.success('Cancelada!'); load(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
  };

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Minhas Reservas" onMenuClick={onMenuClick}
        actions={<Button onClick={() => { setForm({ area: '', date: '', startTime: '', endTime: '', notes: '' }); setModalOpen(true); }} icon={<Plus className="w-4 h-4" />}>Nova reserva</Button>} />
      <div className="p-4 sm:p-6 animate-fade-in">
        {list.length === 0 ? (
          <EmptyState icon={<CalendarDays className="w-8 h-8" />} title="Nenhuma reserva" description="Solicite sua primeira reserva."
            action={<Button onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>Solicitar</Button>} />
        ) : (
          <div className="space-y-3">
            {list.map((r) => (
              <div key={r._id} className="premium-list-card p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{r.area}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-slate-500">{formatDate(r.date)} • {r.startTime} - {r.endTime}</p>
                    {r.notes && <p className="text-sm text-slate-600 mt-1">{r.notes}</p>}
                  </div>
                  {(r.status === 'pending' || r.status === 'approved') && (
                    <Button size="sm" variant="ghost" onClick={() => cancel(r._id)} icon={<XCircle className="w-3.5 h-3.5" />}>Cancelar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova reserva">
        <div className="space-y-4">
          <Select label="Área *" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
            options={COMMON_AREAS.map(a => ({ value: a, label: a }))} placeholder="Selecione" />
          <Input label="Data *" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora início *" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="Hora fim *" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <Textarea label="Observação" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreate} loading={saving} className="flex-1">Solicitar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default MyReservations;
