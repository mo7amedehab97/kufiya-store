-- Create coupons table for Palestinian Kufiya Store
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    min_order_amount DECIMAL(10,2) DEFAULT 0 CHECK (min_order_amount >= 0),
    max_uses INTEGER DEFAULT NULL CHECK (max_uses IS NULL OR max_uses > 0),
    current_uses INTEGER DEFAULT 0 CHECK (current_uses >= 0),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraint to ensure current_uses doesn't exceed max_uses
ALTER TABLE coupons ADD CONSTRAINT check_uses_limit 
CHECK (max_uses IS NULL OR current_uses <= max_uses);

-- Add constraint for percentage discounts (cannot exceed 100%)
ALTER TABLE coupons ADD CONSTRAINT check_percentage_limit 
CHECK (discount_type != 'percentage' OR discount_value <= 100);

-- Insert sample coupon data
INSERT INTO coupons (
    code, 
    discount_type, 
    discount_value, 
    min_order_amount, 
    max_uses, 
    current_uses, 
    expires_at, 
    is_active
) VALUES 
(
    'WELCOME10',
    'percentage',
    10.00,
    0.00,
    100,
    15,
    NOW() + INTERVAL '30 days',
    true
),
(
    'PALESTINE20',
    'percentage',
    20.00,
    15.00,
    50,
    8,
    NOW() + INTERVAL '60 days',
    true
),
(
    'FREESHIP',
    'fixed',
    5.00,
    10.00,
    200,
    45,
    NOW() + INTERVAL '90 days',
    true
),
(
    'SOLIDARITY15',
    'percentage',
    15.00,
    0.00,
    75,
    22,
    NOW() + INTERVAL '45 days',
    true
),
(
    'SAVE25',
    'percentage',
    25.00,
    25.00,
    25,
    12,
    NOW() + INTERVAL '14 days',
    true
),
(
    'EXPIRED10',
    'percentage',
    10.00,
    0.00,
    50,
    35,
    NOW() - INTERVAL '5 days',
    false
),
(
    'MAXEDOUT',
    'fixed',
    3.00,
    5.00,
    20,
    20,
    NOW() + INTERVAL '30 days',
    true
),
(
    'NEWCUSTOMER',
    'percentage',
    15.00,
    0.00,
    NULL,
    5,
    NULL,
    true
)
ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at when coupon is modified
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies if needed (optional)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to coupons" ON coupons FOR ALL USING (true);

-- Display created coupons for verification
SELECT 
    code,
    discount_type,
    discount_value,
    min_order_amount,
    max_uses,
    current_uses,
    expires_at,
    is_active,
    CASE 
        WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'EXPIRED'
        WHEN max_uses IS NOT NULL AND current_uses >= max_uses THEN 'MAXED OUT'
        WHEN is_active = false THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END as status
FROM coupons 
ORDER BY created_at DESC;
