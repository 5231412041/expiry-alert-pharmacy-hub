
import { medicineAPI } from './api';
import { Medicine, MedicineStatus, MedicineWithStatus, SummaryStats } from '../types/models';

// Re-export MedicineStatus enum to maintain backward compatibility
export { MedicineStatus } from '../types/models';

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
  return await medicineAPI.addMedicine(medicine);
}

// Get all medicines with their status
export async function getAllMedicines(): Promise<MedicineWithStatus[]> {
  const medicines = await medicineAPI.getAllMedicines();
  
  // Ensure date objects are properly parsed from API response
  return medicines.map((medicine: Medicine) => ({
    ...medicine,
    expiryDate: new Date(medicine.expiryDate),
    manufactureDate: new Date(medicine.manufactureDate),
    addedAt: new Date(medicine.addedAt),
    status: calculateMedicineStatus(new Date(medicine.expiryDate))
  }));
}

// Get medicines by status
export async function getMedicinesByStatus(status: MedicineStatus): Promise<MedicineWithStatus[]> {
  const medicines = await medicineAPI.getMedicinesByStatus(status);
  
  // Ensure date objects are properly parsed from API response
  return medicines.map((medicine: Medicine) => ({
    ...medicine,
    expiryDate: new Date(medicine.expiryDate),
    manufactureDate: new Date(medicine.manufactureDate),
    addedAt: new Date(medicine.addedAt),
    status
  }));
}

// Get medicine by id
export async function getMedicineById(id: string): Promise<MedicineWithStatus | null> {
  try {
    const medicine = await medicineAPI.getMedicineById(id);
    
    if (!medicine) return null;
    
    return {
      ...medicine,
      expiryDate: new Date(medicine.expiryDate),
      manufactureDate: new Date(medicine.manufactureDate),
      addedAt: new Date(medicine.addedAt),
      status: calculateMedicineStatus(new Date(medicine.expiryDate))
    };
  } catch (error) {
    console.error('Error fetching medicine:', error);
    return null;
  }
}

// Update medicine
export async function updateMedicine(medicine: Medicine): Promise<Medicine> {
  return await medicineAPI.updateMedicine(medicine);
}

// Delete medicine
export async function deleteMedicine(id: string): Promise<boolean> {
  await medicineAPI.deleteMedicine(id);
  return true;
}

// Get summary statistics
export async function getMedicineSummary(): Promise<SummaryStats> {
  return await medicineAPI.getMedicineSummary();
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
  // Format dates for API transmission
  const formattedData = csvData.map(item => ({
    ...item,
    manufactureDate: item.manufactureDate instanceof Date ? item.manufactureDate.toISOString() : item.manufactureDate,
    expiryDate: item.expiryDate instanceof Date ? item.expiryDate.toISOString() : item.expiryDate
  }));
  
  const importedMedicines = await medicineAPI.importMedicinesFromCSV(formattedData);
  
  // Parse dates from API response
  return importedMedicines.map((medicine: Medicine) => ({
    ...medicine,
    expiryDate: new Date(medicine.expiryDate),
    manufactureDate: new Date(medicine.manufactureDate),
    addedAt: new Date(medicine.addedAt)
  }));
}
