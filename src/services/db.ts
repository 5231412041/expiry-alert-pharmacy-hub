
/**
 * IMPORTANT NOTICE:
 * 
 * This file is now a placeholder for documentation purposes only.
 * The application has been migrated to use PostgreSQL instead of IndexedDB.
 * 
 * To set up the PostgreSQL database:
 * 
 * 1. Create a PostgreSQL database named 'pharmacy_db'
 * 2. Update your credentials in the src/config.ts file
 * 3. Run the SQL migration script included in the repository at 'scripts/database-setup.sql'
 * 
 * The backend API service will handle all database interactions.
 * See src/config.ts for database connection settings.
 */

import { dbConfig } from '../config';

// This function is now just for compatibility with existing code
export async function initDB(): Promise<void> {
  console.log('PostgreSQL database will be used instead of IndexedDB');
  console.log('Please ensure your PostgreSQL credentials are set in src/config.ts');
  console.log(`Database configuration: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
}

// This function is now just for compatibility with existing code
export async function getDB(): Promise<any> {
  console.warn('getDB() is deprecated. Use API services instead.');
  return null;
}
