import { v4 as uuidv4 } from 'uuid';
import { getDB } from './db';
import { Notification, Medicine, MedicineWithStatus, MedicineStatus } from '../types/models';
import { getMedicinesByStatus } from './medicineService';

// Add notification
export async function addNotification(medicineId: string, type: 'email' | 'whatsapp'): Promise<Notification> {
  const db = await getDB();
  
  const notification: Notification = {
    id: uuidv4(),
    medicineId,
    type,
    status: 'pending',
    createdAt: new Date()
  };
  
  await db.put('notifications', notification);
  return notification;
}

// Get notifications by medicine ID
export async function getNotificationsByMedicine(medicineId: string): Promise<Notification[]> {
  const db = await getDB();
  const index = db.transaction('notifications').store.index('by-medicine');
  return index.getAll(medicineId);
}

// Mark notification as sent
export async function markNotificationAsSent(id: string): Promise<Notification> {
  const db = await getDB();
  const notification = await db.get('notifications', id);
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  const updatedNotification: Notification = {
    ...notification,
    status: 'sent',
    sentAt: new Date()
  };
  
  await db.put('notifications', updatedNotification);
  return updatedNotification;
}

// Mark notification as failed
export async function markNotificationAsFailed(id: string): Promise<Notification> {
  const db = await getDB();
  const notification = await db.get('notifications', id);
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  const updatedNotification: Notification = {
    ...notification,
    status: 'failed'
  };
  
  await db.put('notifications', updatedNotification);
  return updatedNotification;
}

// Generate email notification content
export function generateEmailContent(medicine: MedicineWithStatus): string {
  const expiryDateFormatted = medicine.expiryDate.toLocaleDateString();
  
  if (medicine.status === MedicineStatus.EXPIRED) {
    return `ALERT: ${medicine.name} (Batch: ${medicine.batch}) has EXPIRED on ${expiryDateFormatted}. Please remove from inventory immediately.`;
  } else if (medicine.status === MedicineStatus.EXPIRING_SOON) {
    return `WARNING: ${medicine.name} (Batch: ${medicine.batch}) will expire on ${expiryDateFormatted}. Please take action soon.`;
  } else {
    return `INFO: ${medicine.name} (Batch: ${medicine.batch}) will expire on ${expiryDateFormatted}.`;
  }
}

// Generate WhatsApp notification content
export function generateWhatsAppContent(medicine: MedicineWithStatus): string {
  // Similar to email but possibly shorter for WhatsApp
  const expiryDateFormatted = medicine.expiryDate.toLocaleDateString();
  
  if (medicine.status === MedicineStatus.EXPIRED) {
    return `🔴 EXPIRED: ${medicine.name} (${medicine.batch}) on ${expiryDateFormatted}`;
  } else if (medicine.status === MedicineStatus.EXPIRING_SOON) {
    return `🟠 EXPIRING SOON: ${medicine.name} (${medicine.batch}) on ${expiryDateFormatted}`;
  } else {
    return `ℹ️ ${medicine.name} expires on ${expiryDateFormatted}`;
  }
}

// Simulate sending email notification (in a real app, this would connect to an email service)
export async function sendEmailNotification(medicine: MedicineWithStatus, email: string): Promise<boolean> {
  console.log(`[EMAIL NOTIFICATION] To: ${email}`);
  console.log(generateEmailContent(medicine));
  
  // In a real app, we'd connect to an email service here
  // For this demo, we'll just simulate success
  return true;
}

// Simulate sending WhatsApp notification (in a real app, this would use pywhatkit or an API)
export async function sendWhatsAppNotification(medicine: MedicineWithStatus, phoneNumber: string): Promise<boolean> {
  console.log(`[WHATSAPP NOTIFICATION] To: ${phoneNumber}`);
  console.log(generateWhatsAppContent(medicine));
  
  // In a real app, we'd connect to WhatsApp API or use another service here
  // For this demo, we'll just simulate success
  return true;
}

// Process pending notifications for expiring/expired medicines
export async function processPendingNotifications(userEmail: string, phoneNumber: string): Promise<void> {
  // Get expiring and expired medicines
  const expiringSoonMedicines = await getMedicinesByStatus(MedicineStatus.EXPIRING_SOON);
  const expiredMedicines = await getMedicinesByStatus(MedicineStatus.EXPIRED);
  
  const medicinesNeedingNotification = [...expiringSoonMedicines, ...expiredMedicines];
  
  for (const medicine of medicinesNeedingNotification) {
    // Create email notification
    const emailNotification = await addNotification(medicine.id, 'email');
    try {
      await sendEmailNotification(medicine, userEmail);
      await markNotificationAsSent(emailNotification.id);
    } catch (error) {
      console.error('Failed to send email notification:', error);
      await markNotificationAsFailed(emailNotification.id);
    }
    
    // Create WhatsApp notification
    const whatsappNotification = await addNotification(medicine.id, 'whatsapp');
    try {
      await sendWhatsAppNotification(medicine, phoneNumber);
      await markNotificationAsSent(whatsappNotification.id);
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      await markNotificationAsFailed(whatsappNotification.id);
    }
  }
}
