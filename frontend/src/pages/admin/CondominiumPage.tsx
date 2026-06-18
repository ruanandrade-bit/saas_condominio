import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Building2, CreditCard, MapPin, Save } from 'lucide-react';
import { BRAZILIAN_STATES } from '../../utils/helpers';
import api from '../../services/api';
import { Condominium } from '../../types';
import toast from 'react-hot-toast';

const CondominiumPage: React.FC = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [condo, setCondo] = useState<Condominium | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', cnpj: '', address: '', city: '', state: '', pixKey: '', defaultFee: 0, dueDay: 10 });

  useEffect(() => {
    const loadCondominium = async () => {
      try {
        const { data } = await api.get('/condominiums/my');
        setCondo(data);
        setForm({ name: data.name, cnpj: data.cnpj, address: data.address, city: data.city, state: data.state, pixKey: data.pixKey, defaultFee: data.defaultFee, dueDay: data.dueDay });
      } catch (err: any) {
        if (err.response?.status !== 404) {
          toast.error(err.response?.data?.error || 'Erro ao carregar condomínio');
        }
      }
      finally { setLoading(false); }
    };
    loadCondominium();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Informe o nome do condomínio');
      return;
    }
    if (form.dueDay < 1 || form.dueDay > 31) {
      toast.error('O dia de vencimento deve ficar entre 1 e 31');
      return;
    }

    setSaving(true);
    try {
      const { data } = condo
        ? await api.put(`/condominiums/${condo._id}`, form)
        : await api.post('/condominiums', form);
      setCondo(data);
      toast.success(condo ? 'Condomínio atualizado!' : 'Condomínio criado!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Carregando..." />;

  return (
    <div>
      <Header title="Condomínio" subtitle="Configurações do condomínio" onMenuClick={onMenuClick}
        actions={<Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>Salvar</Button>} />
      <div className="animate-fade-in p-4 sm:p-6">
        <div className="grid max-w-5xl gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-950">Dados do condomínio</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">Informações exibidas nas rotinas administrativas</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} containerClassName="sm:col-span-2" />
              <Input label="CNPJ" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
              <Input label="Endereço" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <Input label="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Select label="Estado" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} options={BRAZILIAN_STATES.map(s => ({ value: s, label: s }))} placeholder="Selecione" />
              <Input label="Chave Pix" value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} containerClassName="sm:col-span-2" />
              <Input label="Taxa padrão (R$)" type="number" min="0" step="0.01" value={String(form.defaultFee)} onChange={(e) => setForm({ ...form, defaultFee: Number(e.target.value) })} />
              <Input label="Dia de vencimento" type="number" min="1" max="31" value={String(form.dueDay)} onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })} />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="premium-hero rounded-lg p-5 text-white shadow-lg shadow-slate-950/10">
              <MapPin className="h-5 w-5 text-blue-400" />
              <h3 className="mt-4 text-sm font-extrabold">Identidade da gestão</h3>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-400">
                Mantenha estes dados atualizados para uma comunicação consistente com moradores.
              </p>
            </div>
            <div className="surface-card p-5">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h3 className="mt-4 text-sm font-extrabold text-slate-950">Configuração financeira</h3>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                A taxa padrão e o vencimento agilizam a criação de novas cobranças.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CondominiumPage;
