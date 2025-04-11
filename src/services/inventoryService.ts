
import { inventoryAPI } from './api';
import { Medicine } from '../types/models';

// Update medicine stock quantity
export async function updateMedicineStock(medicineId: string, newQuantity: number): Promise<Medicine> {
  const updatedMedicine = await inventoryAPI.updateMedicineStock(medicineId, newQuantity);
  
  // Parse dates
  return {
    ...updatedMedicine,
    expiryDate: new Date(updatedMedicine.expiryDate),
    manufactureDate: new Date(updatedMedicine.manufactureDate),
    addedAt: new Date(updatedMedicine.addedAt)
  };
}

// Generate stock report by expiry date
export async function generateStockReport(): Promise<{
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiredItems: number;
  expiringSoonItems: number;
  totalValue: number;
}> {
  return await inventoryAPI.generateStockReport();
}

// Log stock adjustment
export async function logStockAdjustment(medicineId: string, adjustmentAmount: number, userId: string): Promise<void> {
  await inventoryAPI.logStockAdjustment(medicineId, adjustmentAmount, userId);
}
