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

-- Create shipping_methods table
CREATE TABLE IF NOT EXISTS shipping_methods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    estimated_days_min INTEGER NOT NULL DEFAULT 3,
    estimated_days_max INTEGER NOT NULL DEFAULT 7,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping_zones table
CREATE TABLE IF NOT EXISTS shipping_zones (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    countries TEXT[] NOT NULL,
    shipping_method_id INTEGER REFERENCES shipping_methods(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add coupon and shipping columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- Insert default shipping methods
INSERT INTO shipping_methods (name, name_ar, description, description_ar, price, estimated_days_min, estimated_days_max) VALUES
('Standard Shipping', 'شحن عادي', 'Free standard shipping worldwide', 'شحن عادي مجاني عالمياً', 0.00, 5, 10),
('Express Shipping', 'شحن سريع', 'Fast delivery in 2-4 business days', 'توصيل سريع في 2-4 أيام عمل', 15.00, 2, 4),
('Overnight Shipping', 'شحن ليلي', 'Next day delivery for urgent orders', 'توصيل في اليوم التالي للطلبات العاجلة', 35.00, 1, 1)
ON CONFLICT DO NOTHING;

-- Insert sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, expires_at) VALUES
('WELCOME10', 'percentage', 10.00, 0.00, 100, NOW() + INTERVAL '30 days'),
('PALESTINE20', 'percentage', 20.00, 15.00, 50, NOW() + INTERVAL '60 days'),
('FREESHIP', 'fixed', 5.00, 10.00, 200, NOW() + INTERVAL '90 days'),
('SOLIDARITY15', 'percentage', 15.00, 0.00, 75, NOW() + INTERVAL '45 days')
ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_coupon ON orders(coupon_code);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);
