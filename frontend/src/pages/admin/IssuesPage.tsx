import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';
import { formatDate, getUnitLabel, categoryLabels, priorityLabels, priorityColors } from '../../utils/helpers';
import api from '../../services/api';
import { Issue } from '../../types';
import toast from 'react-hot-toast';

const IssuesPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Issue | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/issues', { params: { status: filterStatus || undefined, priority: filterPriority || undefined } });
      setIssues(data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filterStatus, filterPriority]);

  const openDetail = (issue: Issue) => { setSelected(issue); setResponse(issue.response || ''); setDetailOpen(true); };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.patch(`/issues/${selected._id}/status`, { status, response });
      toast.success('Atualizado!'); setDetailOpen(false); load();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Ocorrências" subtitle={`${issues.length} ocorrências`} onMenuClick={onMenuClick} />
      <div className="p-4 sm:p-6 space-y-4 animate-fade-in">
        <div className="filter-bar flex flex-col gap-3 sm:flex-row">
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            options={[{ value: 'open', label: 'Aberta' }, { value: 'in_progress', label: 'Em análise' }, { value: 'resolved', label: 'Resolvida' }]} placeholder="Status" />
          <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            options={[{ value: 'low', label: 'Baixa' }, { value: 'medium', label: 'Média' }, { value: 'high', label: 'Alta' }]} placeholder="Prioridade" />
        </div>

        {issues.length === 0 ? (
          <EmptyState icon={<AlertTriangle className="w-8 h-8" />} title="Nenhuma ocorrência" description="Nenhuma ocorrência aberta no momento." />
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <button key={issue._id} onClick={() => openDetail(issue)} className="premium-list-card w-full p-5 text-left cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                      <StatusBadge status={issue.status} />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>{priorityLabels[issue.priority]}</span>
                    </div>
                    <p className="text-sm text-slate-500">{getUnitLabel(issue.unitId)} • {categoryLabels[issue.category]} • {formatDate(issue.createdAt)}</p>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{issue.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalhes da ocorrência" size="lg">
        {selected && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={selected.status} />
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[selected.priority]}`}>{priorityLabels[selected.priority]}</span>
                <span className="text-xs text-slate-400">{categoryLabels[selected.category]}</span>
              </div>
              <h3 className="font-semibold text-lg">{selected.title}</h3>
              <p className="text-sm text-slate-500">{getUnitLabel(selected.unitId)} • {formatDate(selected.createdAt)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.description}</p>
            </div>
            <Textarea label="Resposta do síndico" value={response} onChange={(e) => setResponse(e.target.value)} rows={3} placeholder="Escreva sua resposta..." />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="secondary" onClick={() => updateStatus('in_progress')} loading={saving}>Em análise</Button>
              <Button variant="success" onClick={() => updateStatus('resolved')} loading={saving}>Resolvida</Button>
              <Button variant="ghost" onClick={() => setDetailOpen(false)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default IssuesPage;
