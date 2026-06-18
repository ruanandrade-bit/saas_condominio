import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Receipt, Copy } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../services/api';
import { Charge, Condominium } from '../../types';
import toast from 'react-hot-toast';

const MyCharges: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [condo, setCondo] = useState<Condominium | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, co] = await Promise.all([api.get('/charges'), api.get('/condominiums/my')]);
        setCharges(c.data); setCondo(co.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const copyPix = () => {
    if (condo?.pixKey) { navigator.clipboard.writeText(condo.pixKey); toast.success('Chave Pix copiada!'); }
  };

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Minhas Cobranças" onMenuClick={onMenuClick}
      />
      <div className="p-4 sm:p-6 animate-fade-in">
        {condo?.pixKey && (
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">Pagamento via Pix</p>
              <p className="mt-1 break-all text-sm font-bold text-blue-950">{condo.pixKey}</p>
            </div>
            <button onClick={copyPix} className="flex self-start items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-blue-700 shadow-sm ring-1 ring-blue-100 transition-all hover:-translate-y-0.5 hover:shadow-md sm:self-auto">
              <Copy className="h-3.5 w-3.5" />
              Copiar chave
            </button>
          </div>
        )}
        {charges.length === 0 ? (
          <EmptyState icon={<Receipt className="w-8 h-8" />} title="Nenhuma cobrança" description="Você não possui cobranças no momento." />
        ) : (
          <div className="space-y-3">
            {charges.map((ch) => (
              <div key={ch._id} className={`premium-list-card p-5 sm:p-6 ${ch.status === 'late' ? 'border-red-200 ring-1 ring-red-100' : ''}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{ch.description}</p>
                    <p className="text-sm text-slate-500">Ref: {ch.referenceMonth} • Vence: {formatDate(ch.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(ch.amount)}</p>
                    <StatusBadge status={ch.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyCharges;
