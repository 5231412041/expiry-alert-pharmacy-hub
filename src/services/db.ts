
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface PharmacyDB extends DBSchema {
  users: {
    key: string; // email as key
    value: {
      id: string;
      name: string;
      email: string;
      password: string; // In a real app, this would be hashed
      role: 'admin' | 'staff';
      createdAt: Date;
    };
    indexes: { 'by-email': string };
  };
  medicines: {
    key: string; // id
    value: {
      id: string;
      name: string;
      batch: string;
      quantity: number;
      manufacturer: string;
      manufactureDate: Date;
      expiryDate: Date;
      addedBy: string; // email of user who added
      addedAt: Date;
    };
    indexes: { 
      'by-name': string;
      'by-expiry': Date;
    };
  };
  notifications: {
    key: string; // id
    value: {
      id: string;
      medicineId: string;
      type: 'email' | 'whatsapp';
      status: 'pending' | 'sent' | 'failed';
      createdAt: Date;
      sentAt?: Date;
    };
    indexes: { 'by-medicine': string };
  };
}

let db: IDBPDatabase<PharmacyDB>;

export async function initDB(): Promise<IDBPDatabase<PharmacyDB>> {
  if (db) return db;
  
  db = await openDB<PharmacyDB>('pharmacy-expiry-tracker', 1, {
    upgrade(db) {
      // Create users store
      const userStore = db.createObjectStore('users', { keyPath: 'email' });
      userStore.createIndex('by-email', 'email');

      // Create medicines store
      const medicineStore = db.createObjectStore('medicines', { keyPath: 'id' });
      medicineStore.createIndex('by-name', 'name');
      medicineStore.createIndex('by-expiry', 'expiryDate');
      
      // Create notifications store
      const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
      notificationStore.createIndex('by-medicine', 'medicineId');
    }
  });

  return db;
}

export async function getDB(): Promise<IDBPDatabase<PharmacyDB>> {
  if (!db) {
    return initDB();
  }
  return db;
}
