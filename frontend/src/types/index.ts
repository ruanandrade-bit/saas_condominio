export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'resident';
  condominiumId?: string;
  unitId?: string;
}

export interface Condominium {
  _id: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  pixKey: string;
  defaultFee: number;
  dueDay: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  _id: string;
  condominiumId: string;
  block: string;
  number: string;
  status: 'occupied' | 'empty' | 'late';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  _id: string;
  condominiumId: string;
  unitId: string | { _id: string; block: string; number: string };
  name: string;
  phone: string;
  email: string;
  type: 'owner' | 'tenant' | 'financial_responsible';
  isFinancialResponsible: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Charge {
  _id: string;
  condominiumId: string;
  unitId: string | { _id: string; block: string; number: string };
  residentId?: string | { _id: string; name: string; phone: string; email: string } | null;
  referenceMonth: string;
  amount: number;
  dueDate: string;
  description: string;
  status: 'pending' | 'paid' | 'late';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  condominiumId: string;
  title: string;
  message: string;
  category: 'general' | 'maintenance' | 'assembly' | 'security' | 'financial';
  isPinned: boolean;
  createdBy: string | { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  _id: string;
  condominiumId: string;
  unitId: string | { _id: string; block: string; number: string };
  residentId?: string | { _id: string; name: string } | null;
  title: string;
  description: string;
  category: 'noise' | 'maintenance' | 'security' | 'cleaning' | 'garage' | 'leak' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  response: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  _id: string;
  condominiumId: string;
  unitId: string | { _id: string; block: string; number: string };
  residentId?: string | { _id: string; name: string } | null;
  area: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  receivedThisMonth: number;
  toReceive: number;
  late: number;
  totalUnits: number;
  openIssues: number;
  pendingReservations: number;
}

export interface AdminDashboard {
  stats: DashboardStats;
  lateCharges: Charge[];
  recentAnnouncements: Announcement[];
  recentIssues: Issue[];
  upcomingReservations: Reservation[];
}

export interface ResidentDashboard {
  stats: {
    pendingCharges: number;
    recentAnnouncements: number;
    openIssues: number;
    upcomingReservations: number;
  };
  pendingCharges: Charge[];
  recentAnnouncements: Announcement[];
  openIssues: Issue[];
  upcomingReservations: Reservation[];
}

export interface RegisterData {
  name: string;
  phone?: string;
  email: string;
  password: string;
  condominiumName: string;
  city?: string;
  state?: string;
  pixKey?: string;
  defaultFee?: number;
  dueDay?: number;
}
