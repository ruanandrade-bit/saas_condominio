import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Megaphone, Pin } from 'lucide-react';
import { formatDate, categoryLabels } from '../../utils/helpers';
import api from '../../services/api';
import { Announcement } from '../../types';

const ResidentAnnouncements: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const { data } = await api.get('/announcements'); setList(data); }
      catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Comunicados" onMenuClick={onMenuClick} />
      <div className="p-4 sm:p-6 animate-fade-in">
        {list.length === 0 ? (
          <EmptyState icon={<Megaphone className="w-8 h-8" />} title="Nenhum comunicado" description="Nenhum comunicado no momento." />
        ) : (
          <div className="space-y-3">
            {list.map((a) => (
              <div key={a._id} className={`premium-list-card p-5 sm:p-6 ${a.isPinned ? 'border-blue-300 ring-1 ring-blue-100' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  {a.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                  <h3 className="font-semibold text-slate-900">{a.title}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{categoryLabels[a.category]}</span>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{a.message}</p>
                <p className="text-xs text-slate-400 mt-2">{formatDate(a.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ResidentAnnouncements;
