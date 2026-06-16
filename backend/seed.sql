-- Seed data for local development
-- Replace the password hash with a real bcrypt hash for production

-- Insert a demo tenant
INSERT INTO tenants (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo');

-- Insert a Director (password: Admin@123)
-- Hash generated with bcrypt rounds=12
INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000001',
   'Admin Director',
   'admin@demo.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCEi2wX8zFpKJ0w3V4XKFBS',
   'Director');

-- Insert a Manager (password: Manager@123)
INSERT INTO users (id, tenant_id, name, email, password_hash, role, reports_to) VALUES
  ('00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000001',
   'Sales Manager',
   'manager@demo.com',
   '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Manager',
   '00000000-0000-0000-0000-000000000010');

-- Insert Engineers (password: Engineer@123)
INSERT INTO users (id, tenant_id, name, email, password_hash, role, reports_to, dept) VALUES
  ('00000000-0000-0000-0000-000000000020',
   '00000000-0000-0000-0000-000000000001',
   'Raj Kumar',
   'raj@demo.com',
   '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Engineer',
   '00000000-0000-0000-0000-000000000011',
   'Field Service'),
  ('00000000-0000-0000-0000-000000000021',
   '00000000-0000-0000-0000-000000000001',
   'Priya Singh',
   'priya@demo.com',
   '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Engineer',
   '00000000-0000-0000-0000-000000000011',
   'Field Service');

-- Insert a sample customer
INSERT INTO customers (id, tenant_id, code, name, city, region, contact_name, contact_phone) VALUES
  ('00000000-0000-0000-0000-000000000030',
   '00000000-0000-0000-0000-000000000001',
   'CUST001', 'ABC Industries', 'Mumbai', 'West', 'Ramesh Patel', '9876543210');

-- Insert a machine for that customer
INSERT INTO machines (customer_id, name, model, product_type, serial_no, install_year) VALUES
  ('00000000-0000-0000-0000-000000000030', 'CNC Machine #1', 'XR-2000', 'CNC', 'SN-001-2022', 2022);
