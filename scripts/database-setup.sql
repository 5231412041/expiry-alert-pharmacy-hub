
-- Pharmacy Management Database Setup Script

-- Create the database if it doesn't exist
-- Note: Run this command separately: CREATE DATABASE pharmacy_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- In a production environment, this should be hashed
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    batch VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    manufacturer VARCHAR(255),
    manufacture_date DATE,
    expiry_date DATE NOT NULL,
    added_by VARCHAR(255) NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on expiry date for faster queries
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines(expiry_date);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'whatsapp')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

-- Create index for medicine_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_medicine ON notifications(medicine_id);

-- Recipients table
CREATE TABLE IF NOT EXISTS recipients (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100),
    receive_email BOOLEAN NOT NULL DEFAULT TRUE,
    receive_whatsapp BOOLEAN NOT NULL DEFAULT FALSE
);

-- Stock logs table
CREATE TABLE IF NOT EXISTS stock_logs (
    id UUID PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id),
    adjustment_amount INTEGER NOT NULL,
    user_id UUID REFERENCES users(id),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for medicine_id
CREATE INDEX IF NOT EXISTS idx_stock_logs_medicine ON stock_logs(medicine_id);

-- Insert a default admin user (password: admin123)
INSERT INTO users (id, name, email, password, role)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@example.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;
