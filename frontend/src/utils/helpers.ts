export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('pt-BR');
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
  if (cleaned.length === 10) return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`;
  return phone;
};

export const getUnitLabel = (unit: any): string => {
  if (!unit) return '-';
  if (typeof unit === 'string') return unit;
  const block = unit.block ? `Bloco ${unit.block} - ` : '';
  return `${block}Apt ${unit.number}`;
};

export const statusLabels: Record<string, string> = {
  pending: 'Pendente', paid: 'Pago', late: 'Atrasado',
  open: 'Aberta', in_progress: 'Em análise', resolved: 'Resolvida',
  approved: 'Aprovada', rejected: 'Recusada', cancelled: 'Cancelada',
  occupied: 'Ocupada', empty: 'Vazia',
};

export const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  late: 'bg-red-100 text-red-800',
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  occupied: 'bg-green-100 text-green-800',
  empty: 'bg-gray-100 text-gray-800',
};

export const categoryLabels: Record<string, string> = {
  general: 'Geral', maintenance: 'Manutenção', assembly: 'Assembleia',
  security: 'Segurança', financial: 'Financeiro',
  noise: 'Barulho', cleaning: 'Limpeza', garage: 'Garagem',
  leak: 'Vazamento', other: 'Outro',
};

export const priorityLabels: Record<string, string> = {
  low: 'Baixa', medium: 'Média', high: 'Alta',
};

export const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export const residentTypeLabels: Record<string, string> = {
  owner: 'Proprietário', tenant: 'Inquilino', financial_responsible: 'Responsável financeiro',
};

export const COMMON_AREAS = [
  'Salão de festas', 'Churrasqueira', 'Espaço gourmet', 'Quadra', 'Outra',
];

export const BRAZILIAN_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];
