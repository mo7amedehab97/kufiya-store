-- Direct SQL setup for Palestinian Kufiya Store
-- Run this directly in your PostgreSQL database

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    card_number TEXT NOT NULL,
    card_expiry TEXT NOT NULL,
    card_cvv TEXT NOT NULL,
    card_name TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    order_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing admin users and add new ones
DELETE FROM admin_users;

-- Insert admin users with plain text passwords for easy access
INSERT INTO admin_users (username, password_hash, email) VALUES 
('admin', 'admin123', 'admin@kufiya-store.com'),
('mohamed.helles97', 'Lplp12345$$', 'mohamed.helles97@kufiya-store.com'),
('test', 'test123', 'test@kufiya-store.com');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

-- Verify setup
SELECT 'Admin users created:' as message;
SELECT username, email FROM admin_users ORDER BY id;
