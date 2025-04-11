
import axios from 'axios';
import { Medicine, User, Notification, MedicineWithStatus, SummaryStats, MedicineStatus } from '../types/models';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Default local development server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string, role: 'admin' | 'staff') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },
  
  // Set auth token for subsequent requests
  setAuthToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('auth-token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth-token');
    }
  },
};

// Medicine API
export const medicineAPI = {
  getAllMedicines: async () => {
    const response = await api.get('/medicines');
    return response.data;
  },
  
  getMedicinesByStatus: async (status: MedicineStatus) => {
    const response = await api.get(`/medicines/status/${status}`);
    return response.data;
  },
  
  getMedicineById: async (id: string) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  },
  
  addMedicine: async (medicine: Omit<Medicine, 'id' | 'addedAt'>) => {
    const response = await api.post('/medicines', medicine);
    return response.data;
  },
  
  updateMedicine: async (medicine: Medicine) => {
    const response = await api.put(`/medicines/${medicine.id}`, medicine);
    return response.data;
  },
  
  deleteMedicine: async (id: string) => {
    const response = await api.delete(`/medicines/${id}`);
    return response.data;
  },
  
  getMedicineSummary: async () => {
    const response = await api.get('/medicines/summary');
    return response.data;
  },
  
  importMedicinesFromCSV: async (csvData: Array<any>) => {
    const response = await api.post('/medicines/import', { medicines: csvData });
    return response.data;
  },
};

// Notification API
export const notificationAPI = {
  addNotification: async (medicineId: string, type: 'email' | 'whatsapp') => {
    const response = await api.post('/notifications', { medicineId, type });
    return response.data;
  },
  
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  getNotificationsByMedicine: async (medicineId: string) => {
    const response = await api.get(`/notifications/medicine/${medicineId}`);
    return response.data;
  },
  
  markNotificationAsSent: async (id: string) => {
    const response = await api.put(`/notifications/${id}/sent`);
    return response.data;
  },
  
  markNotificationAsFailed: async (id: string) => {
    const response = await api.put(`/notifications/${id}/failed`);
    return response.data;
  },
  
  processPendingNotifications: async () => {
    const response = await api.post('/notifications/process');
    return response.data;
  },
  
  scheduleAutomatedNotifications: async (interval: string, time: string) => {
    const response = await api.post('/notifications/schedule', { interval, time });
    return response.data;
  },
  
  getAllRecipients: async () => {
    const response = await api.get('/notifications/recipients');
    return response.data;
  },
  
  addRecipient: async (recipient: any) => {
    const response = await api.post('/notifications/recipients', recipient);
    return response.data;
  },
  
  updateRecipient: async (recipient: any) => {
    const response = await api.put(`/notifications/recipients/${recipient.id}`, recipient);
    return response.data;
  },
  
  removeRecipient: async (id: string) => {
    const response = await api.delete(`/notifications/recipients/${id}`);
    return response.data;
  },
};

// Inventory API
export const inventoryAPI = {
  updateMedicineStock: async (medicineId: string, newQuantity: number) => {
    const response = await api.put(`/inventory/medicines/${medicineId}/stock`, { quantity: newQuantity });
    return response.data;
  },
  
  generateStockReport: async () => {
    const response = await api.get('/inventory/report');
    return response.data;
  },
  
  logStockAdjustment: async (medicineId: string, adjustmentAmount: number, userId: string) => {
    const response = await api.post('/inventory/log', { medicineId, adjustmentAmount, userId });
    return response.data;
  },
};

// Initialize API with token if available
const token = localStorage.getItem('auth-token');
if (token) {
  authAPI.setAuthToken(token);
}

export default api;
