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
import { Plus, AlertTriangle } from 'lucide-react';
import { formatDate, categoryLabels, priorityLabels, priorityColors } from '../../utils/helpers';
import api from '../../services/api';
import { Issue } from '../../types';
import toast from 'react-hot-toast';

const MyIssues: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'other', priority: 'medium' });

  const load = async () => {
    try { const { data } = await api.get('/issues'); setIssues(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.description) { toast.error('Título e descrição são obrigatórios'); return; }
    setSaving(true);
    try {
      await api.post('/issues', form);
      toast.success('Ocorrência registrada!'); setModalOpen(false); load();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const catOpts = [
    { value: 'noise', label: 'Barulho' }, { value: 'maintenance', label: 'Manutenção' },
    { value: 'security', label: 'Segurança' }, { value: 'cleaning', label: 'Limpeza' },
    { value: 'garage', label: 'Garagem' }, { value: 'leak', label: 'Vazamento' }, { value: 'other', label: 'Outro' },
  ];

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Minhas Ocorrências" onMenuClick={onMenuClick}
        actions={<Button onClick={() => { setForm({ title: '', description: '', category: 'other', priority: 'medium' }); setModalOpen(true); }} icon={<Plus className="w-4 h-4" />}>Nova ocorrência</Button>} />
      <div className="p-4 sm:p-6 animate-fade-in">
        {issues.length === 0 ? (
          <EmptyState icon={<AlertTriangle className="w-8 h-8" />} title="Nenhuma ocorrência" description="Nenhuma ocorrência aberta no momento."
            action={<Button onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>Abrir ocorrência</Button>} />
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue._id} className="premium-list-card p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                  <StatusBadge status={issue.status} />
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>{priorityLabels[issue.priority]}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                <p className="text-xs text-slate-400">{categoryLabels[issue.category]} • {formatDate(issue.createdAt)}</p>
                {issue.response && (
                  <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-medium text-blue-800 mb-1">Resposta do síndico:</p>
                    <p className="text-sm text-blue-700">{issue.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova ocorrência">
        <div className="space-y-4">
          <Input label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Resumo do problema" />
          <Textarea label="Descrição *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Descreva o problema em detalhes..." />
          <Select label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={catOpts} />
          <Select label="Prioridade" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={[{ value: 'low', label: 'Baixa' }, { value: 'medium', label: 'Média' }, { value: 'high', label: 'Alta' }]} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreate} loading={saving} className="flex-1">Registrar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default MyIssues;
