-- Clear existing admin users and add them with proper passwords
DELETE FROM admin_users;

-- Add admin user with password: admin123
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('admin', 'admin123', 'admin@kufiya-store.com');

-- Add Mohamed admin user with password: Lplp12345$$
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('mohamed.helles97', 'Lplp12345$$', 'mohamed.helles97@kufiya-store.com');

-- Add a test admin user for verification
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('test', 'test123', 'test@kufiya-store.com');
