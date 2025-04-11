// PostgreSQL Configuration
// Update these values with your local PostgreSQL credentials
export const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'pharmacy_db',
  user: 'postgres',
  password: 'your_password', // Replace with your actual password
};

// API Configuration
export const apiConfig = {
  baseUrl: process.env.API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 seconds
};

// Other app configuration
export const appConfig = {
  notificationCheckInterval: 3600000, // 1 hour in milliseconds
};
