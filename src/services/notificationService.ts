import { v4 as uuidv4 } from 'uuid';
import { getDB } from './db';
import { Notification, Medicine, MedicineWithStatus, MedicineStatus, Recipient } from '../types/models';
import { getMedicinesByStatus } from './medicineService';

// Add notification
export async function addNotification(medicineId: string, type: 'email' | 'whatsapp'): Promise<Notification> {
  const db = await getDB();
  
  // Fetch the medicine to generate the message content
  const medicine = await db.get('medicines', medicineId);
  
  // Generate a default message based on medicine data and notification type
  let defaultMessage = "Notification about medicine";
  
  if (medicine) {
    const medicineWithStatus = {
      ...medicine,
      status: getMedicineStatus(medicine)
    };
    
    // Use the appropriate content generation function based on type
    if (type === 'email') {
      defaultMessage = generateEmailContent(medicineWithStatus);
    } else {
      defaultMessage = generateWhatsAppContent(medicineWithStatus);
    }
  }
  
  const notification: Notification = {
    id: uuidv4(),
    medicineId,
    type,
    status: 'pending',
    createdAt: new Date(),
    message: defaultMessage // Add the message property that was missing
  };
  
  await db.put('notifications', notification);
  return notification;
}

// Helper function to determine medicine status
function getMedicineStatus(medicine: Medicine): MedicineStatus {
  const today = new Date();
  const daysUntilExpiry = Math.ceil((medicine.expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  if (daysUntilExpiry <= 0) {
    return MedicineStatus.EXPIRED;
  } else if (daysUntilExpiry <= 30) {
    return MedicineStatus.EXPIRING_SOON;
  } else {
    return MedicineStatus.SAFE;
  }
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
  // Get all recipients who should receive notifications
  const recipients = await getAllRecipients();
  const emailRecipients = recipients.filter(r => r.receiveEmail).map(r => r.email);
  const whatsappRecipients = recipients.filter(r => r.receiveWhatsapp).map(r => r.phone).filter(Boolean);
  
  // If no configured recipients, use the provided userEmail and phoneNumber as fallback
  const emailsToNotify = emailRecipients.length > 0 ? emailRecipients : [userEmail];
  const phonesToNotify = whatsappRecipients.length > 0 ? whatsappRecipients : [phoneNumber];
  
  // Get expiring and expired medicines
  const expiringSoonMedicines = await getMedicinesByStatus(MedicineStatus.EXPIRING_SOON);
  const expiredMedicines = await getMedicinesByStatus(MedicineStatus.EXPIRED);
  
  const medicinesNeedingNotification = [...expiringSoonMedicines, ...expiredMedicines];
  
  for (const medicine of medicinesNeedingNotification) {
    // Send email notifications
    for (const email of emailsToNotify) {
      if (!email) continue;
      
      // Create email notification
      const emailNotification = await addNotification(medicine.id, 'email');
      try {
        await sendEmailNotification(medicine, email);
        await markNotificationAsSent(emailNotification.id);
      } catch (error) {
        console.error('Failed to send email notification:', error);
        await markNotificationAsFailed(emailNotification.id);
      }
    }
    
    // Send WhatsApp notifications
    for (const phone of phonesToNotify) {
      if (!phone) continue;
      
      // Create WhatsApp notification
      const whatsappNotification = await addNotification(medicine.id, 'whatsapp');
      try {
        await sendWhatsAppNotification(medicine, phone);
        await markNotificationAsSent(whatsappNotification.id);
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
        await markNotificationAsFailed(whatsappNotification.id);
      }
    }
  }
}

// Schedule automated notifications
export async function scheduleAutomatedNotifications(interval: string, time: string): Promise<void> {
  // In a real app, this would set up a cron job or similar
  // For this demo, we'll simulate it with localStorage
  localStorage.setItem('notificationSchedule', JSON.stringify({ interval, time }));
  
  console.log(`Automated notifications scheduled: ${interval} at ${time}`);
  
  // In a real application with a backend, you would set up a schedule here
  // For this frontend-only app, we simulate it with a check that would run when the app starts
  
  // Here's what an actual implementation might look like in a backend:
  /*
  const cron = require('node-cron');
  
  // Clear any existing scheduled tasks
  if (global.scheduledNotificationTask) {
    global.scheduledNotificationTask.stop();
  }
  
  // Set up the new schedule
  let cronExpression;
  const [hours, minutes] = time.split(':');
  
  switch (interval) {
    case 'daily':
      cronExpression = `${minutes} ${hours} * * *`;
      break;
    case 'weekly':
      cronExpression = `${minutes} ${hours} * * 1`; // Monday
      break;
    case 'monthly':
      cronExpression = `${minutes} ${hours} 1 * *`; // 1st of month
      break;
    default:
      cronExpression = `${minutes} ${hours} * * *`; // Default daily
  }
  
  global.scheduledNotificationTask = cron.schedule(cronExpression, async () => {
    console.log('Running automated notification task');
    // Get recipient info from database
    const userEmail = 'admin@example.com';
    const phoneNumber = '+1234567890';
    await processPendingNotifications(userEmail, phoneNumber);
  });
  */
}

// Recipient management

// Get all recipients
export async function getAllRecipients(): Promise<Recipient[]> {
  try {
    const db = await getDB();
    // Check if the recipients store exists first
    const stores = Array.from(db.transaction('recipients').store.indexNames);
    if (stores) {
      return await db.getAll('recipients');
    }
    return [];
  } catch (error) {
    console.error('Error in getAllRecipients:', error);
    // Recipients store might not exist yet, return empty array
    return [];
  }
}

// Add a notification recipient
export async function addRecipient(recipient: Omit<Recipient, 'id'>): Promise<Recipient> {
  const db = await getDB();
  
  // Ensure the recipients store exists
  try {
    db.transaction('recipients');
  } catch (error) {
    // Store doesn't exist yet, we'll create it when we try to add
    console.log('Recipients store does not exist yet, will be created');
  }
  
  const newRecipient: Recipient = {
    ...recipient,
    id: uuidv4()
  };
  
  await db.put('recipients', newRecipient);
  return newRecipient;
}

// Update a recipient
export async function updateRecipient(recipient: Recipient): Promise<Recipient> {
  const db = await getDB();
  await db.put('recipients', recipient);
  return recipient;
}

// Remove a recipient
export async function removeRecipient(id: string): Promise<boolean> {
  const db = await getDB();
  await db.delete('recipients', id);
  return true;
}
