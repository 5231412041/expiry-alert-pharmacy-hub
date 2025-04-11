
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { User, Medicine, Notification } from '../types/models';

// Recipient interface
interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  receiveEmail: boolean;
  receiveWhatsapp: boolean;
}

interface PharmacyDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  medicines: {
    key: string;
    value: Medicine;
    indexes: { 'by-expiry': Date };
  };
  notifications: {
    key: string;
    value: Notification;
    indexes: { 'by-medicine': string };
  };
  recipients: {
    key: string;
    value: Recipient;
    indexes: { 'by-role': string };
  };
  stockLogs: {
    key: string;
    value: {
      id: string;
      medicineId: string;
      adjustmentAmount: number;
      userId: string;
      timestamp: Date;
    };
    indexes: { 'by-medicine': string };
  };
}

let db: IDBPDatabase<PharmacyDB>;

export async function initDB(): Promise<void> {
  db = await openDB<PharmacyDB>('pharmacy-db', 1, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email', { unique: true });
      }
      
      // Medicines store
      if (!db.objectStoreNames.contains('medicines')) {
        const medicineStore = db.createObjectStore('medicines', { keyPath: 'id' });
        medicineStore.createIndex('by-expiry', 'expiryDate');
      }
      
      // Notifications store
      if (!db.objectStoreNames.contains('notifications')) {
        const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
        notificationStore.createIndex('by-medicine', 'medicineId');
      }
      
      // Recipients store
      if (!db.objectStoreNames.contains('recipients')) {
        const recipientStore = db.createObjectStore('recipients', { keyPath: 'id' });
        recipientStore.createIndex('by-role', 'role');
      }
      
      // Stock Logs store
      if (!db.objectStoreNames.contains('stockLogs')) {
        const stockLogStore = db.createObjectStore('stockLogs', { keyPath: 'id' });
        stockLogStore.createIndex('by-medicine', 'medicineId');
      }
    }
  });
}

export async function getDB(): Promise<IDBPDatabase<PharmacyDB>> {
  if (!db) {
    await initDB();
  }
  return db;
}
