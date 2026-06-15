import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Pencil, Trash2, Pin, Megaphone, MessageCircle, Copy } from 'lucide-react';
import { formatDate, categoryLabels } from '../../utils/helpers';
import api from '../../services/api';
import { Announcement } from '../../types';
import toast from 'react-hot-toast';

const AnnouncementsPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', category: 'general', isPinned: false });

  const load = async () => {
    try { const { data } = await api.get('/announcements'); setList(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', message: '', category: 'general', isPinned: false }); setModalOpen(true); };
  const openEdit = (a: Announcement) => { setEditing(a); setForm({ title: a.title, message: a.message, category: a.category, isPinned: a.isPinned }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.message) { toast.error('Título e mensagem são obrigatórios'); return; }
    setSaving(true);
    try {
      if (editing) { await api.put(`/announcements/${editing._id}`, form); toast.success('Atualizado!'); }
      else { await api.post('/announcements', form); toast.success('Criado!'); }
      setModalOpen(false); load();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const handleDel = async (id: string) => {
    if (!confirm('Excluir comunicado?')) return;
    try { await api.delete(`/announcements/${id}`); toast.success('Excluído!'); load(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
  };

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success('Texto copiado!'); };

  if (loading) return <LoadingSpinner text="Carregando..." />;

  const catOptions = Object.entries(categoryLabels).filter(([k]) => ['general','maintenance','assembly','security','financial'].includes(k)).map(([v, l]) => ({ value: v, label: l }));

  return (
    <div>
      <Header title="Comunicados" subtitle={`${list.length} comunicados`} onMenuClick={onMenuClick}
        actions={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Novo comunicado</Button>} />
      <div className="p-4 sm:p-6 animate-fade-in">
        {list.length === 0 ? (
          <EmptyState icon={<Megaphone className="w-8 h-8" />} title="Nenhum comunicado" description="Crie seu primeiro comunicado."
            action={<Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Criar</Button>} />
        ) : (
          <div className="space-y-3">
            {list.map((a) => (
              <div key={a._id} className={`bg-white rounded-xl border p-5 sm:p-6 ${a.isPinned ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {a.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                      <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{categoryLabels[a.category]}</span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{a.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDate(a.createdAt)}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => copyText(a.message)} className="icon-button" title="Copiar comunicado" aria-label="Copiar comunicado"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(a)} className="icon-button hover:text-blue-600" title="Editar comunicado" aria-label="Editar comunicado"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDel(a._id)} className="icon-button hover:border-red-100 hover:bg-red-50 hover:text-red-600" title="Excluir comunicado" aria-label="Excluir comunicado"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar comunicado' : 'Novo comunicado'} size="lg">
        <div className="space-y-4">
          <Input label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Mensagem *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} />
          <Select label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={catOptions} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} className="rounded" />
            Fixar comunicado
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default AnnouncementsPage;
