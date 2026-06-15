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
import { Plus, Pencil, Trash2, Home } from 'lucide-react';
import api from '../../services/api';
import { Unit } from '../../types';
import toast from 'react-hot-toast';

const UnitsPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState({ block: '', number: '', status: 'empty', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try { const { data } = await api.get('/units'); setUnits(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ block: '', number: '', status: 'empty', notes: '' }); setModalOpen(true); };
  const openEdit = (u: Unit) => { setEditing(u); setForm({ block: u.block, number: u.number, status: u.status, notes: u.notes }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.number) { toast.error('Informe o número'); return; }
    setSaving(true);
    try {
      if (editing) { await api.put(`/units/${editing._id}`, form); toast.success('Atualizada!'); }
      else { await api.post('/units', form); toast.success('Cadastrada!'); }
      setModalOpen(false); fetch();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const handleDel = async (id: string) => {
    if (!confirm('Excluir unidade?')) return;
    try { await api.delete(`/units/${id}`); toast.success('Excluída!'); fetch(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
  };

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Unidades" subtitle={`${units.length} unidades`} onMenuClick={onMenuClick}
        actions={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Nova unidade</Button>} />
      <div className="p-4 sm:p-6 animate-fade-in">
        {units.length === 0 ? (
          <EmptyState icon={<Home className="w-8 h-8" />} title="Nenhuma unidade" description="Você ainda não cadastrou nenhuma unidade."
            action={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Cadastrar</Button>} />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Bloco</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Número</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Obs</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Ações</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm">{u.block || '-'}</td>
                    <td className="px-5 py-3 text-sm font-medium">{u.number}</td>
                    <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-3 text-sm text-slate-500 truncate max-w-xs">{u.notes || '-'}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(u)} className="text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Editar unidade" aria-label="Editar unidade"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDel(u._id)} className="text-slate-400 hover:bg-red-50 hover:text-red-600" title="Excluir unidade" aria-label="Excluir unidade"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar unidade' : 'Nova unidade'}>
        <div className="space-y-4">
          <Input label="Bloco" value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} placeholder="A, B..." />
          <Input label="Número *" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="101..." />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[{ value: 'empty', label: 'Vazia' }, { value: 'occupied', label: 'Ocupada' }, { value: 'late', label: 'Inadimplente' }]} />
          <Input label="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default UnitsPage;
