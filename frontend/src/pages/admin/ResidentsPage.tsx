import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { getUnitLabel, residentTypeLabels } from '../../utils/helpers';
import api from '../../services/api';
import { Resident, Unit } from '../../types';
import toast from 'react-hot-toast';

const ResidentsPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Resident | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', unitId: '', type: 'owner', isFinancialResponsible: false, createAccount: false, password: '123456' });

  const load = async () => {
    try {
      const [r, u] = await Promise.all([api.get('/residents'), api.get('/units')]);
      setResidents(r.data); setUnits(u.data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', unitId: '', type: 'owner', isFinancialResponsible: false, createAccount: false, password: '123456' });
    setModalOpen(true);
  };
  const openEdit = (r: Resident) => {
    setEditing(r);
    const uid = typeof r.unitId === 'object' ? r.unitId._id : r.unitId;
    setForm({ name: r.name, phone: r.phone, email: r.email, unitId: uid, type: r.type, isFinancialResponsible: r.isFinancialResponsible, createAccount: false, password: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.unitId) { toast.error('Nome e unidade são obrigatórios'); return; }
    if (!editing && form.createAccount && !form.email.trim()) {
      toast.error('Informe o e-mail para criar a conta de acesso');
      return;
    }
    if (!editing && form.createAccount && form.password.length < 6) {
      toast.error('A senha inicial deve ter pelo menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      if (editing) { await api.put(`/residents/${editing._id}`, form); toast.success('Atualizado!'); }
      else { await api.post('/residents', form); toast.success('Cadastrado!'); }
      setModalOpen(false); load();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const handleDel = async (id: string) => {
    if (!confirm('Excluir morador?')) return;
    try { await api.delete(`/residents/${id}`); toast.success('Excluído!'); load(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
  };

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Moradores" subtitle={`${residents.length} moradores`} onMenuClick={onMenuClick}
        actions={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Novo morador</Button>} />
      <div className="p-4 sm:p-6 animate-fade-in">
        {residents.length === 0 ? (
          <EmptyState icon={<Users className="w-8 h-8" />} title="Nenhum morador" description="Cadastre moradores para começar."
            action={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Cadastrar</Button>} />
        ) : (
          <div className="surface-card overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Unidade</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tipo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Telefone</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">E-mail</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Ações</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {residents.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span>{r.name}</span>
                        {r.isFinancialResponsible && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 ring-1 ring-blue-100">Financeiro</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{getUnitLabel(r.unitId)}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{residentTypeLabels[r.type]}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{r.phone || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{r.email || '-'}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(r)} className="text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Editar morador" aria-label="Editar morador"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDel(r._id)} className="text-slate-400 hover:bg-red-50 hover:text-red-600" title="Excluir morador" aria-label="Excluir morador"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar morador' : 'Novo morador'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select label="Unidade *" value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })}
              options={units.map(u => ({ value: u._id, label: `${u.block ? 'Bloco '+u.block+' - ' : ''}Apt ${u.number}` }))} placeholder="Selecione" />
            <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[{ value: 'owner', label: 'Proprietário' }, { value: 'tenant', label: 'Inquilino' }, { value: 'financial_responsible', label: 'Resp. Financeiro' }]} />
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.isFinancialResponsible} onChange={(e) => setForm({ ...form, isFinancialResponsible: e.target.checked })} className="rounded" />
            Responsável financeiro
          </label>
          {!editing && (
            <>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.createAccount} onChange={(e) => setForm({ ...form, createAccount: e.target.checked })} className="rounded" />
                Criar conta de acesso para o morador
              </label>
              {form.createAccount && <Input label="Senha inicial" type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
            </>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ResidentsPage;
