/*
  # Create verification codes table

  1. New Tables
    - `verification_codes`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `code` (text, not null)
      - `type` (text, not null) - 'verification' or 'password_reset'
      - `expires_at` (timestamptz, not null)
      - `used` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `verification_codes` table
    - Add policy for anonymous users to insert codes
    - Add policy for system to read/update codes

  3. Indexes
    - Index on email and type for faster lookups
    - Index on expires_at for cleanup operations
*/

CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('verification', 'password_reset')),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_type 
  ON verification_codes(email, type);

CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at 
  ON verification_codes(expires_at);

-- RLS Policies
CREATE POLICY "Allow anonymous to insert verification codes"
  ON verification_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow system to read verification codes"
  ON verification_codes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow system to update verification codes"
  ON verification_codes
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow system to delete verification codes"
  ON verification_codes
  FOR DELETE
  TO anon, authenticated
  USING (true);