export type UserRole = 'admin' | 'manager' | 'technician' | 'store_manager' | 'supervisor';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Machine {
  id: number;
  name: string;
  type: string;
  model: string;
  serial_number: string;
  line: string;
  location: string;
  qr_code: string;
  status: 'running' | 'under_repair' | 'maintenance_due';
  last_service: string;
  purchase_date: string;
}

export interface Breakdown {
  id: number;
  machine_id: number;
  machine_name: string;
  machine_no?: string;
  machine_line: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reported_by_id: number;
  reported_by_name: string;
  status: 'reported' | 'in_progress' | 'resolved';
  reported_at: string;
  resolved_at?: string;
}

export interface SparePart {
  id: number;
  name: string;
  code: string;
  stock: number;
  min_stock: number;
  unit: string;
  category: string;
  price: number;
  needle_size?: string;
}

export interface SparePartUsage {
  id: number;
  machine_id: number;
  machine_name?: string;
  machine_no?: string;
  part_id: number;
  part_name?: string;
  part_code?: string;
  quantity: number;
  unit?: string;
  technician_id: number;
  technician_name?: string;
  date: string;
}

export interface Maintenance {
  id: number;
  machine_id: number;
  machine_name?: string;
  machine_no?: string;
  machine_line?: string;
  type: string;
  technician_id: number;
  technician_name?: string;
  date: string;
  checklist: string;
  description?: string;
  status: 'pending' | 'accepted' | 'completed';
  accepted_at?: string;
  completed_at?: string;
}

export interface MachineHistory {
  maintenance: Maintenance[];
  breakdowns: Breakdown[];
}

export interface Stats {
  totalMachines: number;
  runningMachines: number;
  repairMachines: number;
  maintenanceDue: number;
  lowStock: number;
  todayBreakdowns: number;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  is_read: number;
  created_at: string;
}
