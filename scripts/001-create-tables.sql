-- Create orders table for Palestinian Kufiya Store
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

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('admin', '$2a$10$rOvHv.ZxTbYmF6Q.VYR5/.gY8RoV7nR3.Bd8nE/v9YgJ3Y9K2J4oe', 'admin@kufiya-store.com')
ON CONFLICT (username) DO NOTHING;

-- Insert Mohamed admin user (password: Lplp12345$$)
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('mohamed.helles97', '$2a$10$rOvHv.ZxTbYmF6Q.VYR5/.gY8RoV7nR3.Bd8nE/v9YgJ3Y9K2J4oe', 'mohamed.helles97@kufiya-store.com')
ON CONFLICT (username) DO NOTHING;

-- Enable Row Level Security (optional - you can disable if you want full access)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all access (you can make these more restrictive later)
CREATE POLICY "Allow all access to orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all access to admin_users" ON admin_users FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
