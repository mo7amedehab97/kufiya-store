-- Simple coupons table creation with 2 fake data entries
-- Run this if you just want the basic setup

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 2 fake coupon data
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, current_uses, expires_at, is_active) 
VALUES 
    ('WELCOME10', 'percentage', 10.00, 0.00, 100, 5, NOW() + INTERVAL '30 days', true),
    ('FREESHIP5', 'fixed', 5.00, 15.00, 50, 2, NOW() + INTERVAL '60 days', true)
ON CONFLICT (code) DO NOTHING;

-- Verify the data
SELECT * FROM coupons ORDER BY created_at DESC;
