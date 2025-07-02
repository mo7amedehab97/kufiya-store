-- Create new admin user: mohamed.helles97 with password: Lplp12345$$
-- Note: In production, passwords should be properly hashed with bcrypt
-- For demo purposes, we're using a simple hash representation

INSERT INTO admin_users (username, password_hash, email) 
VALUES (
    'mohamed.helles97', 
    '$2a$10$rOvHv.ZxTbYmF6Q.VYR5/.gY8RoV7nR3.Bd8nE/v9YgJ3Y9K2J4oe', -- This represents the hashed password
    'mohamed.helles97@kufiya-store.com'
)
ON CONFLICT (username) DO NOTHING;

-- Update the existing admin user if needed
UPDATE admin_users 
SET email = 'admin@kufiya-store.com' 
WHERE username = 'admin';
