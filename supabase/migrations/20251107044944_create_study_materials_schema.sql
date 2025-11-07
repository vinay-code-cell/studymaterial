/*
  # Study Material Sharing Hub Database Schema

  ## Overview
  Creates the database structure for a study materials sharing platform for first-year college students.
  No authentication required - public access to all features.

  ## New Tables

  ### 1. materials
  Stores study material metadata and file information
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Material title
  - `description` (text) - Material description
  - `file_url` (text) - URL to the PDF file
  - `file_name` (text) - Original file name
  - `file_size` (bigint) - File size in bytes
  - `upload_date` (timestamptz) - When material was uploaded
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. access_logs
  Tracks when materials are downloaded
  - `id` (uuid, primary key) - Unique identifier
  - `material_id` (uuid, foreign key) - References materials table
  - `ip_address` (text) - User's IP address
  - `access_time` (timestamptz) - When material was accessed
  - `file_name` (text) - Name of accessed file

  ## Security
  - Both tables have RLS enabled
  - Public read access for materials (anyone can view/download)
  - Public insert access for materials (anyone can upload)
  - Public insert access for access_logs (anyone can log access)
  - Public read access for access_logs (admin panel can view logs)

  ## Notes
  - No user authentication system
  - All operations are public
  - IP addresses stored for access tracking only
*/

CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES materials(id) ON DELETE CASCADE,
  ip_address text NOT NULL,
  access_time timestamptz DEFAULT now(),
  file_name text NOT NULL
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all materials"
  ON materials FOR SELECT
  USING (true);

CREATE POLICY "Public can upload materials"
  ON materials FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can delete materials"
  ON materials FOR DELETE
  USING (true);

CREATE POLICY "Public can view access logs"
  ON access_logs FOR SELECT
  USING (true);

CREATE POLICY "Public can create access logs"
  ON access_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_materials_title ON materials(title);
CREATE INDEX IF NOT EXISTS idx_materials_upload_date ON materials(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_material_id ON access_logs(material_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_access_time ON access_logs(access_time DESC);