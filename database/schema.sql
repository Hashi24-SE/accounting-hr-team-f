-- ── CORE 16 TABLES (DB_Architecture_v2) ─────────────────────

-- 1. system_configurations
CREATE TABLE system_configurations (
  config_key   VARCHAR PRIMARY KEY,
  config_value VARCHAR NOT NULL,
  description  TEXT
);

-- 2. organization
CREATE TABLE organization (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR NOT NULL,
  address    TEXT,
  phone      VARCHAR,
  email      VARCHAR,
  logo_url   VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. employees
CREATE TABLE employees (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      VARCHAR NOT NULL,
  nic            VARCHAR UNIQUE NOT NULL,
  dob            DATE NOT NULL,
  designation    VARCHAR NOT NULL,
  department     VARCHAR NOT NULL,
  branch         VARCHAR NOT NULL,
  start_date     DATE NOT NULL,
  contract_type  VARCHAR NOT NULL DEFAULT 'Permanent',
  bank_name      VARCHAR NOT NULL,
  bank_branch    VARCHAR NOT NULL,
  account_number VARCHAR NOT NULL,
  tin            VARCHAR,
  status         VARCHAR NOT NULL DEFAULT 'Active',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- 4. salary_revisions
CREATE TABLE salary_revisions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  basic_salary   DECIMAL(12,2) NOT NULL,
  hourly_ot_rate DECIMAL(8,2) NOT NULL,
  effective_date DATE NOT NULL,
  end_date       DATE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 5. allowance_types
CREATE TABLE allowance_types (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR UNIQUE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. employee_allowances
CREATE TABLE employee_allowances (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  allowance_id   UUID NOT NULL REFERENCES allowance_types(id) ON DELETE RESTRICT,
  amount         DECIMAL(12,2) NOT NULL,
  effective_date DATE NOT NULL,
  end_date       DATE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 7. monthly_attendance
CREATE TABLE monthly_attendance (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  month        INTEGER NOT NULL,
  year         INTEGER NOT NULL,
  working_days INTEGER NOT NULL,
  no_pay_days  DECIMAL(4,1) DEFAULT 0,
  ot_hours     DECIMAL(6,2) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (employee_id, month, year)
);

-- 8. leave_types
CREATE TABLE leave_types (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR UNIQUE NOT NULL,
  is_paid    BOOLEAN NOT NULL DEFAULT TRUE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. employee_leave_balances
CREATE TABLE employee_leave_balances (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  leave_type_id  UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
  year           INTEGER NOT NULL,
  entitled_days  DECIMAL(5,1) NOT NULL,
  used_days      DECIMAL(5,1) NOT NULL DEFAULT 0,
  remaining_days DECIMAL(5,1) GENERATED ALWAYS AS (entitled_days - used_days) STORED,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (employee_id, leave_type_id, year)
);

-- 10. leave_requests
CREATE TABLE leave_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  days_taken    DECIMAL(5,1) NOT NULL,
  reason        TEXT,
  status        VARCHAR NOT NULL DEFAULT 'Pending',
  approved_by   UUID REFERENCES employees(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 11. apit_tax_slabs
CREATE TABLE apit_tax_slabs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_year VARCHAR(9) NOT NULL,
  slab_order     INTEGER NOT NULL,
  min_income     DECIMAL(14,2) NOT NULL,
  max_income     DECIMAL(14,2),
  tax_rate       DECIMAL(5,2) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (financial_year, slab_order)
);

-- 12. loans_and_advances
CREATE TABLE loans_and_advances (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  type              VARCHAR NOT NULL,
  total_amount      DECIMAL(12,2) NOT NULL,
  monthly_deduction DECIMAL(12,2) NOT NULL,
  remaining_balance DECIMAL(12,2) NOT NULL,
  status            VARCHAR NOT NULL DEFAULT 'Active',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- 13. monthly_payslips
CREATE TABLE monthly_payslips (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  pay_period       DATE NOT NULL,
  basic_salary     DECIMAL(12,2) NOT NULL,
  ot_pay           DECIMAL(12,2) NOT NULL,
  no_pay_deduction DECIMAL(12,2) NOT NULL,
  gross_salary     DECIMAL(12,2) NOT NULL,
  epf_employee     DECIMAL(12,2) NOT NULL,
  apit_tax         DECIMAL(12,2) NOT NULL,
  total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_salary       DECIMAL(12,2) NOT NULL,
  epf_employer     DECIMAL(12,2) NOT NULL,
  etf_employer     DECIMAL(12,2) NOT NULL,
  status           VARCHAR NOT NULL DEFAULT 'Draft',
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (employee_id, pay_period)
);

-- 14. payslip_allowances
CREATE TABLE payslip_allowances (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id     UUID NOT NULL REFERENCES monthly_payslips(id) ON DELETE RESTRICT,
  allowance_name VARCHAR NOT NULL,
  amount         DECIMAL(12,2) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 15. payslip_loan_deductions
CREATE TABLE payslip_loan_deductions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id      UUID NOT NULL REFERENCES monthly_payslips(id) ON DELETE RESTRICT,
  loan_id         UUID NOT NULL REFERENCES loans_and_advances(id) ON DELETE RESTRICT,
  amount_deducted DECIMAL(12,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 16. statutory_remittances
CREATE TABLE statutory_remittances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remittance_type VARCHAR NOT NULL,
  pay_period      DATE NOT NULL,
  total_amount    DECIMAL(14,2) NOT NULL,
  due_date        DATE NOT NULL,
  paid_date       DATE,
  reference_no    VARCHAR,
  status          VARCHAR NOT NULL DEFAULT 'Pending',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── AUTH ADDITION TABLES (17–19) ─────────────────────────────

-- 17. users
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR UNIQUE NOT NULL,
  password_hash  VARCHAR NOT NULL,
  role           VARCHAR NOT NULL,
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- 18. refresh_tokens
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. password_reset_tokens
CREATE TABLE password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. notifications
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL,
  recipient_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES users(id),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  payload       JSONB DEFAULT '{}',
  read          BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread    ON notifications(recipient_id, read) WHERE read = false;

-- ── SEED DATA ────────────────────────────────────────────────

-- system_configurations
INSERT INTO system_configurations (config_key, config_value, description) VALUES
  ('EPF_EMP_RATE',    '8.00',     'EPF employee deduction rate (%)'),
  ('EPF_EMP_CONTRIB', '12.00',    'EPF employer contribution rate (%)'),
  ('ETF_RATE',        '3.00',     'ETF employer contribution rate (%)'),
  ('MIN_WAGE',        '15000.00', 'Minimum net salary floor (LKR)');

-- APIT slabs Y/A 2025/2026
INSERT INTO apit_tax_slabs (financial_year, slab_order, min_income, max_income, tax_rate) VALUES
  ('2025/2026', 1,        0.00,  1200000.00,  0.00),
  ('2025/2026', 2,  1200001.00,  1700000.00,  6.00),
  ('2025/2026', 3,  1700001.00,  2200000.00, 12.00),
  ('2025/2026', 4,  2200001.00,  2700000.00, 18.00),
  ('2025/2026', 5,  2700001.00,  4200000.00, 24.00),
  ('2025/2026', 6,  4200001.00,  5700000.00, 30.00),
  ('2025/2026', 7,  5700001.00,        NULL, 36.00);

-- Default leave types
INSERT INTO leave_types (name, is_paid, is_active) VALUES
  ('Annual',  TRUE,  TRUE),
  ('Medical', TRUE,  TRUE),
  ('Casual',  TRUE,  TRUE),
  ('NoPay',   FALSE, TRUE);

-- Default allowance types
INSERT INTO allowance_types (name, is_active) VALUES
  ('Transport', TRUE),
  ('Housing',   TRUE),
  ('Medical',   TRUE),
  ('Meal',      TRUE);

-- Default admin user (password: Admin@1234 — change after first login)
-- Generate hash with: bcryptjs.hashSync('Admin@1234', 12)
INSERT INTO users (email, password_hash, role, active, email_verified) VALUES
  ('admin@greensolutions.tech',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQK6Ub6i',
   'Admin', TRUE, TRUE);
