
-- Pharmacy Management Database Setup Script

-- Create the database if it doesn't exist
-- Note: Run this command separately: CREATE DATABASE pharmacy_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- In a production environment, this should be hashed
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Roles table (separate from users to achieve 3NF)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL CHECK (name IN ('admin', 'staff'))
);

-- User roles (junction table between users and roles)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Manufacturers table (to achieve 3NF by removing manufacturer dependency from medicines)
CREATE TABLE IF NOT EXISTS manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    contact_info VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    batch VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    manufacturer_id INTEGER REFERENCES manufacturers(id),
    manufacture_date DATE,
    expiry_date DATE NOT NULL,
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on expiry date for faster queries
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines(expiry_date);

-- Notification types table (to achieve 3NF)
CREATE TABLE IF NOT EXISTS notification_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL CHECK (name IN ('email', 'whatsapp'))
);

-- Notification status table (to achieve 3NF)
CREATE TABLE IF NOT EXISTS notification_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL CHECK (name IN ('pending', 'sent', 'failed'))
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id),
    type_id INTEGER REFERENCES notification_types(id),
    status_id INTEGER REFERENCES notification_statuses(id),
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Recipient contact details (to achieve 3NF by separating contact info)
CREATE TABLE IF NOT EXISTS recipient_contacts (
    id SERIAL PRIMARY KEY,
    recipient_id UUID REFERENCES recipients(id),
    contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('email', 'phone')),
    contact_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE
);

-- Recipient roles (to achieve 3NF by separating role info)
CREATE TABLE IF NOT EXISTS recipient_roles (
    recipient_id UUID REFERENCES recipients(id),
    role_id INTEGER REFERENCES roles(id),
    PRIMARY KEY (recipient_id, role_id)
);

-- Recipient notification preferences (to achieve 3NF)
CREATE TABLE IF NOT EXISTS recipient_preferences (
    recipient_id UUID REFERENCES recipients(id),
    notification_type_id INTEGER REFERENCES notification_types(id),
    is_enabled BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (recipient_id, notification_type_id)
);

-- Stock logs table
CREATE TABLE IF NOT EXISTS stock_logs (
    id UUID PRIMARY KEY,
    medicine_id UUID REFERENCES medicines(id),
    adjustment_amount INTEGER NOT NULL,
    user_id UUID REFERENCES users(id),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255)
);

-- Create index for medicine_id
CREATE INDEX IF NOT EXISTS idx_stock_logs_medicine ON stock_logs(medicine_id);

-- Insert default roles
INSERT INTO roles (name) VALUES ('admin'), ('staff') ON CONFLICT (name) DO NOTHING;

-- Insert default notification types
INSERT INTO notification_types (name) VALUES ('email'), ('whatsapp') ON CONFLICT (name) DO NOTHING;

-- Insert default notification statuses
INSERT INTO notification_statuses (name) VALUES ('pending'), ('sent'), ('failed') ON CONFLICT (name) DO NOTHING;

-- Insert a default manufacturer
INSERT INTO manufacturers (name) 
VALUES ('Default Manufacturer') ON CONFLICT (name) DO NOTHING;

-- Insert a default admin user (password should be hashed in production)
INSERT INTO users (id, name, email, password)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@example.com', 'Admin123$') 
ON CONFLICT (email) DO NOTHING;

-- Assign admin role to default user
INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM roles WHERE name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

