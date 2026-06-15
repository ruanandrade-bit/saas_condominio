import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, CheckCircle, XCircle, MessageCircle, Receipt, Copy, Layers } from 'lucide-react';
import { formatCurrency, formatDate, getUnitLabel } from '../../utils/helpers';
import { generateWhatsAppMessage, openWhatsApp } from '../../utils/whatsapp';
import api from '../../services/api';
import { Charge, Unit, Condominium } from '../../types';
import toast from 'react-hot-toast';

const ChargesPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [condo, setCondo] = useState<Condominium | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [whatsOpen, setWhatsOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [form, setForm] = useState({ unitId: '', referenceMonth: '', amount: '', dueDate: '', description: 'Taxa condominial' });
  const [bulkForm, setBulkForm] = useState({ referenceMonth: '', amount: '', dueDate: '', description: 'Taxa condominial' });

  const load = async () => {
    try {
      const [c, u, co] = await Promise.all([
        api.get('/charges', { params: { status: filterStatus || undefined, referenceMonth: filterMonth || undefined } }),
        api.get('/units'), api.get('/condominiums/my'),
      ]);
      setCharges(c.data); setUnits(u.data); setCondo(co.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterMonth]);

  const handleCreate = async () => {
    if (!form.unitId || !form.referenceMonth || !form.amount || !form.dueDate) { toast.error('Preencha todos os campos'); return; }
    setSaving(true);
    try {
      await api.post('/charges', { ...form, amount: Number(form.amount) });
      toast.success('Cobrança criada!'); setModalOpen(false); load();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const handleBulk = async () => {
    if (!bulkForm.referenceMonth || !bulkForm.amount || !bulkForm.dueDate) { toast.error('Preencha todos os campos'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/charges/bulk', { ...bulkForm, amount: Number(bulkForm.amount) });
      toast.success(data.message); setBulkOpen(false); load();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const markPaid = async (id: string) => {
    try { await api.patch(`/charges/${id}/mark-paid`); toast.success('Marcado como pago!'); load(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
  };

  const markPending = async (id: string) => {
    try { await api.patch(`/charges/${id}/mark-pending`); toast.success('Marcado como pendente!'); load(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
  };

  const handleWhatsApp = (charge: Charge, type: 'reminder' | 'due_today' | 'friendly_late' | 'formal_late') => {
    const resident = typeof charge.residentId === 'object' ? charge.residentId : null;
    if (!resident?.phone) { toast.error('Morador sem telefone cadastrado'); return; }
    const msg = generateWhatsAppMessage(type, {
      name: resident.name, month: charge.referenceMonth,
      amount: charge.amount.toFixed(2), dueDate: formatDate(charge.dueDate),
      pixKey: condo?.pixKey || '',
    });
    openWhatsApp(resident.phone, msg);
  };

  const copyMessage = (charge: Charge, type: 'reminder' | 'due_today' | 'friendly_late' | 'formal_late') => {
    const resident = typeof charge.residentId === 'object' ? charge.residentId : null;
    const msg = generateWhatsAppMessage(type, {
      name: resident?.name || 'Morador', month: charge.referenceMonth,
      amount: charge.amount.toFixed(2), dueDate: formatDate(charge.dueDate),
      pixKey: condo?.pixKey || '',
    });
    navigator.clipboard.writeText(msg);
    toast.success('Mensagem copiada!');
  };

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Cobranças" subtitle={`${charges.length} cobranças`} onMenuClick={onMenuClick}
        actions={<div className="flex gap-2">
          <Button variant="secondary" onClick={() => setBulkOpen(true)} icon={<Layers className="w-4 h-4" />} size="sm">Em massa</Button>
          <Button onClick={() => { setForm({ unitId: '', referenceMonth: '', amount: condo?.defaultFee?.toString() || '', dueDate: '', description: 'Taxa condominial' }); setModalOpen(true); }} icon={<Plus className="w-4 h-4" />} size="sm">Nova</Button>
        </div>} />
      <div className="p-4 sm:p-6 space-y-4 animate-fade-in">
        {/* Filters */}
        <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            options={[{ value: 'pending', label: 'Pendente' }, { value: 'paid', label: 'Pago' }, { value: 'late', label: 'Atrasado' }]} placeholder="Status" />
          <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} placeholder="Mês" />
        </div>

        {charges.length === 0 ? (
          <EmptyState icon={<Receipt className="w-8 h-8" />} title="Nenhuma cobrança" description="Crie sua primeira cobrança para começar." />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Unidade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Morador</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mês</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Vencimento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Ações</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {charges.map((ch) => {
                  const resident = typeof ch.residentId === 'object' ? ch.residentId : null;
                  return (
                    <tr key={ch._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{getUnitLabel(ch.unitId)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{resident?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{ch.referenceMonth}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(ch.amount)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{formatDate(ch.dueDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={ch.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {ch.status !== 'paid' && (
                            <button onClick={() => markPaid(ch._id)} title="Marcar como pago" aria-label="Marcar como pago" className="text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><CheckCircle className="w-4 h-4" /></button>
                          )}
                          {ch.status === 'paid' && (
                            <button onClick={() => markPending(ch._id)} title="Marcar como pendente" aria-label="Marcar como pendente" className="text-slate-400 hover:bg-amber-50 hover:text-amber-600"><XCircle className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => { setSelectedCharge(ch); setWhatsOpen(true); }} title="WhatsApp" aria-label="Abrir opções de WhatsApp" className="text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><MessageCircle className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova cobrança">
        <div className="space-y-4">
          <Select label="Unidade *" value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })}
            options={units.map(u => ({ value: u._id, label: `${u.block ? 'Bl '+u.block+' - ' : ''}Apt ${u.number}` }))} placeholder="Selecione" />
          <Input label="Mês referência *" type="month" value={form.referenceMonth} onChange={(e) => setForm({ ...form, referenceMonth: e.target.value })} />
          <Input label="Valor *" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Vencimento *" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreate} loading={saving} className="flex-1">Criar</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Modal */}
      <Modal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} title="Cobrança em massa">
        <p className="text-sm text-slate-500 mb-4">Cria cobrança para todas as unidades ocupadas.</p>
        <div className="space-y-4">
          <Input label="Mês referência *" type="month" value={bulkForm.referenceMonth} onChange={(e) => setBulkForm({ ...bulkForm, referenceMonth: e.target.value })} />
          <Input label="Valor *" type="number" value={bulkForm.amount} onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })} />
          <Input label="Vencimento *" type="date" value={bulkForm.dueDate} onChange={(e) => setBulkForm({ ...bulkForm, dueDate: e.target.value })} />
          <Input label="Descrição" value={bulkForm.description} onChange={(e) => setBulkForm({ ...bulkForm, description: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setBulkOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleBulk} loading={saving} className="flex-1">Criar cobranças</Button>
          </div>
        </div>
      </Modal>

      {/* WhatsApp Modal */}
      <Modal isOpen={whatsOpen} onClose={() => setWhatsOpen(false)} title="Enviar WhatsApp">
        <div className="space-y-3">
          {(['reminder', 'due_today', 'friendly_late', 'formal_late'] as const).map((type) => {
            const labels = { reminder: '📩 Lembrete', due_today: '📅 Dia do vencimento', friendly_late: '😊 Atraso amigável', formal_late: '📋 Cobrança formal' };
            return (
              <div key={type} className="border border-slate-200 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">{labels[type]}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" onClick={() => selectedCharge && handleWhatsApp(selectedCharge, type)} icon={<MessageCircle className="w-3.5 h-3.5" />}>Enviar</Button>
                  <Button size="sm" variant="secondary" onClick={() => selectedCharge && copyMessage(selectedCharge, type)} icon={<Copy className="w-3.5 h-3.5" />}>Copiar</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};
export default ChargesPage;
