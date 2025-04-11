
import { notificationAPI } from './api';
import { Notification, Medicine, MedicineWithStatus, MedicineStatus, Recipient } from '../types/models';
import { calculateMedicineStatus } from './medicineService';

// Add notification
export async function addNotification(medicineId: string, type: 'email' | 'whatsapp'): Promise<Notification> {
  return await notificationAPI.addNotification(medicineId, type);
}

// Get notifications for a medicine
export async function getNotificationsByMedicine(medicineId: string): Promise<Notification[]> {
  const notifications = await notificationAPI.getNotificationsByMedicine(medicineId);
  
  // Parse dates from API response
  return notifications.map((notification: Notification) => ({
    ...notification,
    createdAt: new Date(notification.createdAt),
    sentAt: notification.sentAt ? new Date(notification.sentAt) : undefined
  }));
}

// Mark notification as sent
export async function markNotificationAsSent(id: string): Promise<Notification> {
  const notification = await notificationAPI.markNotificationAsSent(id);
  
  // Parse dates
  return {
    ...notification,
    createdAt: new Date(notification.createdAt),
    sentAt: notification.sentAt ? new Date(notification.sentAt) : undefined
  };
}

// Mark notification as failed
export async function markNotificationAsFailed(id: string): Promise<Notification> {
  const notification = await notificationAPI.markNotificationAsFailed(id);
  
  // Parse dates
  return {
    ...notification,
    createdAt: new Date(notification.createdAt),
    sentAt: notification.sentAt ? new Date(notification.sentAt) : undefined
  };
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
  const expiryDateFormatted = medicine.expiryDate.toLocaleDateString();
  
  if (medicine.status === MedicineStatus.EXPIRED) {
    return `🔴 EXPIRED: ${medicine.name} (${medicine.batch}) on ${expiryDateFormatted}`;
  } else if (medicine.status === MedicineStatus.EXPIRING_SOON) {
    return `🟠 EXPIRING SOON: ${medicine.name} (${medicine.batch}) on ${expiryDateFormatted}`;
  } else {
    return `ℹ️ ${medicine.name} expires on ${expiryDateFormatted}`;
  }
}

// Process pending notifications for expiring/expired medicines
export async function processPendingNotifications(): Promise<void> {
  await notificationAPI.processPendingNotifications();
}

// Schedule automated notifications - fix to match expected arguments
export async function scheduleAutomatedNotifications(settings: { interval: string, time: string }): Promise<void> {
  await notificationAPI.scheduleAutomatedNotifications(settings.interval, settings.time);
}

// Recipient management

// Get all recipients
export async function getAllRecipients(): Promise<Recipient[]> {
  try {
    return await notificationAPI.getAllRecipients();
  } catch (error) {
    console.error('Error in getAllRecipients:', error);
    return [];
  }
}

// Add a notification recipient
export async function addRecipient(recipient: Omit<Recipient, 'id'>): Promise<Recipient> {
  return await notificationAPI.addRecipient(recipient);
}

// Update a recipient
export async function updateRecipient(recipient: Recipient): Promise<Recipient> {
  return await notificationAPI.updateRecipient(recipient);
}

// Remove a recipient
export async function removeRecipient(id: string): Promise<boolean> {
  await notificationAPI.removeRecipient(id);
  return true;
}
