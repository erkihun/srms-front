INSERT INTO departments (name, description)
VALUES
  ('ICT Department', 'Central ICT support unit'),
  ('Finance Department', 'Handles finance and budget'),
  ('Human Resources', 'HR services and staffing')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description, is_active)
VALUES
  ('Hardware', 'PC, printer, network equipment issues', true),
  ('Software', 'Application errors, installation, updates', true),
  ('Network', 'Connectivity, VPN, internet access', true),
  ('Other', 'Other ICT-related issues', true)
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  ict_dep_id INTEGER;
  finance_dep_id INTEGER;
  hr_dep_id INTEGER;
  admin_id INTEGER;
  tech_id INTEGER;
  employee_id INTEGER;
  hardware_cat_id INTEGER;
BEGIN
  SELECT id INTO ict_dep_id FROM departments WHERE name = 'ICT Department';
  SELECT id INTO finance_dep_id FROM departments WHERE name = 'Finance Department';
  SELECT id INTO hr_dep_id FROM departments WHERE name = 'Human Resources';
  SELECT id INTO hardware_cat_id FROM categories WHERE name = 'Hardware';

  -- Admin
  SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';
  IF admin_id IS NULL THEN
    INSERT INTO users (full_name, email, password_hash, role, department_id, is_active, username, phone)
    VALUES (
      'System Administrator',
      'admin@example.com',
      crypt('Admin@123', gen_salt('bf')),
      'ADMIN',
      ict_dep_id,
      TRUE,
      'admin',
      '0700000000'
    )
    RETURNING id INTO admin_id;
  END IF;

  -- Technician
  SELECT id INTO tech_id FROM users WHERE email = 'tech@example.com';
  IF tech_id IS NULL THEN
    INSERT INTO users (full_name, email, password_hash, role, department_id, is_active, username, phone)
    VALUES (
      'Tech User',
      'tech@example.com',
      crypt('Tech@123', gen_salt('bf')),
      'TECHNICIAN',
      ict_dep_id,
      TRUE,
      'tech',
      '0700000001'
    )
    RETURNING id INTO tech_id;
  END IF;

  -- Employee
  SELECT id INTO employee_id FROM users WHERE email = 'employee@example.com';
  IF employee_id IS NULL THEN
    INSERT INTO users (full_name, email, password_hash, role, department_id, is_active, username, phone)
    VALUES (
      'Employee User',
      'employee@example.com',
      crypt('Employee@123', gen_salt('bf')),
      'EMPLOYEE',
      hr_dep_id,
      TRUE,
      'employee',
      '0700000002'
    )
    RETURNING id INTO employee_id;
  END IF;

  -- Sample ticket
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE ticket_code = 'ICT-INIT-001') THEN
    INSERT INTO tickets (
      ticket_code, title, description, status, priority,
      requester_id, assigned_to_id, department_id, category_id
    ) VALUES (
      'ICT-INIT-001',
      'Onboarding laptop not booting',
      'New starter laptop powers on but shows no display.',
      'NEW',
      'HIGH',
      employee_id,
      tech_id,
      ict_dep_id,
      hardware_cat_id
    );
  END IF;

  -- Sample task
  IF NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Install antivirus on finance PCs') THEN
    INSERT INTO tasks (
      title, description, status, priority, assigned_to, created_by, due_date, technician_note
    ) VALUES (
      'Install antivirus on finance PCs',
      'Deploy antivirus on 10 Finance department workstations.',
      'OPEN',
      'MEDIUM',
      tech_id,
      admin_id,
      NOW() + INTERVAL '3 days',
      'Schedule with finance team'
    );
  END IF;
END$$;
