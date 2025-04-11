
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In real application, this would be hashed
  role: 'admin' | 'staff';
  createdAt: Date;
}

export interface Medicine {
  id: string;
  name: string;
  batch: string;
  quantity: number;
  manufacturer: string;
  manufactureDate: Date;
  expiryDate: Date;
  addedBy: string; // email of user who added
  addedAt: Date;
}

export enum MedicineStatus {
  SAFE = 'safe',
  EXPIRING_SOON = 'expiring-soon',
  EXPIRED = 'expired'
}

export interface MedicineWithStatus extends Medicine {
  status: MedicineStatus;
}

export interface Notification {
  id: string;
  medicineId: string;
  type: 'email' | 'whatsapp';
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  // Adding message property that's used in the Notifications component
  message: string;
}

export interface SummaryStats {
  total: number;
  safe: number;
  expiringSoon: number;
  expired: number;
}

export interface ChartData {
  name: string;
  value: number;
}

// Adding Recipient interface that's referenced in Notifications component
export interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  receiveEmail: boolean;
  receiveWhatsapp: boolean;
}
