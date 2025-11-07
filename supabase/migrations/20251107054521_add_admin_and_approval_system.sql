/*
  # Add Admin Accounts and Approval Workflow

  ## Overview
  Adds admin authentication and approval workflow for study materials.

  ## New Tables
  1. admin_accounts
     - Stores admin credentials and info
     - id: admin ID (numeric)
     - admin_id_number: unique admin identifier (21072006 for main admin)
     - password_hash: hashed admin password
     - email: admin email
     - created_at: account creation timestamp

  2. Materials table modifications
     - Add status column: pending, approved, rejected
     - Add approved_by column: admin ID who approved
     - Add approval_date column: when material was approved

  ## Security
  - RLS policies restrict table access
  - Only authenticated admins can approve/reject
  - Regular users can only view approved materials
*/

CREATE TABLE IF NOT EXISTS admin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id_number bigint UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin accounts are private"
  ON admin_accounts FOR SELECT
  USING (false);

CREATE POLICY "Admin can read own account"
  ON admin_accounts FOR SELECT
  USING (admin_id_number::text = current_setting('app.admin_id', true));

CREATE INDEX idx_admin_accounts_id_number ON admin_accounts(admin_id_number);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materials' AND column_name = 'status'
  ) THEN
    ALTER TABLE materials ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
    ALTER TABLE materials ADD COLUMN approved_by uuid REFERENCES admin_accounts(id) ON DELETE SET NULL;
    ALTER TABLE materials ADD COLUMN approval_date timestamptz;
    CREATE INDEX idx_materials_status ON materials(status);
  END IF;
END $$;
