
# Pharmacy Management System

## PostgreSQL Database Setup

This application uses PostgreSQL for data storage. Follow these steps to set up your local database:

### 1. Install PostgreSQL

If you haven't already installed PostgreSQL, download and install it from the [official website](https://www.postgresql.org/download/).

### 2. Create the Database

Open the PostgreSQL command line tool (psql) and run:

```sql
CREATE DATABASE pharmacy_db;
```

### 3. Run the Setup Script

Navigate to the project directory and run the setup script:

```bash
psql -U your_username -d pharmacy_db -f scripts/database-setup.sql
```

Replace `your_username` with your PostgreSQL username.

### 4. Configure the Application

Update your database credentials in `src/config.ts`:

```typescript
export const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'pharmacy_db',
  user: 'your_username',
  password: 'your_password'
};
```

### 5. Setup Backend API Server

The frontend application expects a backend API server running on `http://localhost:5000`. You will need to implement this server using a technology like Node.js/Express, Python/Django, etc.

The server should implement the API endpoints defined in the `src/services/api.ts` file and connect to your PostgreSQL database.

## Default Admin User

After running the setup script, a default admin user will be created:

- Email: admin@example.com
- Password: admin123

## Development

To start the frontend application:

```bash
npm install
npm run dev
```
