
import { getDB } from './db';
import { Medicine } from '../types/models';

// Update medicine stock quantity
export async function updateMedicineStock(medicineId: string, newQuantity: number): Promise<Medicine> {
  const db = await getDB();
  
  // Get the current medicine
  const medicine = await db.get('medicines', medicineId);
  
  if (!medicine) {
    throw new Error('Medicine not found');
  }
  
  // Update quantity
  const updatedMedicine = {
    ...medicine,
    quantity: newQuantity
  };
  
  // Save back to database
  await db.put('medicines', updatedMedicine);
  
  return updatedMedicine;
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
  const db = await getDB();
  const medicines = await db.getAll('medicines');
  
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  
  // Assuming each medicine has a price field, if not we can add it later
  const report = {
    totalItems: medicines.length,
    lowStockItems: medicines.filter(med => med.quantity < 10).length,
    outOfStockItems: medicines.filter(med => med.quantity === 0).length,
    expiredItems: medicines.filter(med => med.expiryDate < now).length,
    expiringSoonItems: medicines.filter(med => med.expiryDate >= now && med.expiryDate <= thirtyDaysFromNow).length,
    totalValue: 0 // This would need price information to be accurate
  };
  
  return report;
}

// Log stock adjustment
export async function logStockAdjustment(medicineId: string, adjustmentAmount: number, userId: string): Promise<void> {
  const db = await getDB();
  
  // Create a log object
  const log = {
    id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    medicineId,
    adjustmentAmount,
    userId,
    timestamp: new Date()
  };
  
  // Store in a 'stockLogs' object store (we would need to create this store in db.ts)
  // For now, we'll just log to console since we haven't set up that store yet
  console.log('Stock adjustment logged:', log);
  
  // In a full implementation, we would do:
  // await db.add('stockLogs', log);
}
