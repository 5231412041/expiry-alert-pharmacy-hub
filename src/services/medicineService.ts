
import { v4 as uuidv4 } from 'uuid';
import { getDB } from './db';
import { Medicine, MedicineStatus, MedicineWithStatus, SummaryStats } from '../types/models';

// Helper function to calculate medicine status
export function calculateMedicineStatus(expiryDate: Date): MedicineStatus {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  
  if (expiryDate < now) {
    return MedicineStatus.EXPIRED;
  } else if (expiryDate < thirtyDaysFromNow) {
    return MedicineStatus.EXPIRING_SOON;
  } else {
    return MedicineStatus.SAFE;
  }
}

// Add a new medicine
export async function addMedicine(medicine: Omit<Medicine, 'id' | 'addedAt'>): Promise<Medicine> {
  const db = await getDB();
  
  const newMedicine: Medicine = {
    ...medicine,
    id: uuidv4(),
    addedAt: new Date()
  };
  
  await db.put('medicines', newMedicine);
  return newMedicine;
}

// Get all medicines with their status
export async function getAllMedicines(): Promise<MedicineWithStatus[]> {
  const db = await getDB();
  const medicines = await db.getAll('medicines');
  
  return medicines.map(medicine => ({
    ...medicine,
    status: calculateMedicineStatus(medicine.expiryDate)
  }));
}

// Get medicines by status
export async function getMedicinesByStatus(status: MedicineStatus): Promise<MedicineWithStatus[]> {
  const allMedicines = await getAllMedicines();
  return allMedicines.filter(medicine => medicine.status === status);
}

// Get medicine by id
export async function getMedicineById(id: string): Promise<MedicineWithStatus | null> {
  const db = await getDB();
  const medicine = await db.get('medicines', id);
  
  if (!medicine) return null;
  
  return {
    ...medicine,
    status: calculateMedicineStatus(medicine.expiryDate)
  };
}

// Update medicine
export async function updateMedicine(medicine: Medicine): Promise<Medicine> {
  const db = await getDB();
  await db.put('medicines', medicine);
  return medicine;
}

// Delete medicine
export async function deleteMedicine(id: string): Promise<boolean> {
  const db = await getDB();
  await db.delete('medicines', id);
  return true;
}

// Get summary statistics
export async function getMedicineSummary(): Promise<SummaryStats> {
  const allMedicines = await getAllMedicines();
  
  const result: SummaryStats = {
    total: allMedicines.length,
    safe: 0,
    expiringSoon: 0,
    expired: 0
  };
  
  allMedicines.forEach(medicine => {
    switch (medicine.status) {
      case MedicineStatus.SAFE:
        result.safe++;
        break;
      case MedicineStatus.EXPIRING_SOON:
        result.expiringSoon++;
        break;
      case MedicineStatus.EXPIRED:
        result.expired++;
        break;
    }
  });
  
  return result;
}

// Import medicines from CSV data
export async function importMedicinesFromCSV(
  csvData: Array<{
    name: string;
    batch: string;
    quantity: number;
    manufacturer: string;
    manufactureDate: Date;
    expiryDate: Date;
    addedBy: string;
  }>
): Promise<Medicine[]> {
  const db = await getDB();
  const tx = db.transaction('medicines', 'readwrite');
  
  const newMedicines: Medicine[] = [];
  
  for (const item of csvData) {
    const medicine: Medicine = {
      ...item,
      id: uuidv4(),
      addedAt: new Date()
    };
    
    await tx.store.add(medicine);
    newMedicines.push(medicine);
  }
  
  await tx.done;
  return newMedicines;
}
