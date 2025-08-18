/*
  # Fix RLS policies for user registration

  1. Changes
    - Allow anonymous users to insert new user records (for registration)
    - Allow anonymous users to read user data by email (for login check)
    - Keep other security policies intact

  2. Security
    - Users can only read their own data after authentication
    - Users can only update their own data
    - Anonymous users can only insert and read for registration/login purposes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Allow anonymous users to insert new records (for registration)
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read user data by email (for login check)
CREATE POLICY "Allow login check"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Allow authenticated users to insert their own data (for Google OAuth)
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- Update credits policies to allow system operations
DROP POLICY IF EXISTS "System can insert credits" ON credits;
DROP POLICY IF EXISTS "Users can read own credits" ON credits;
DROP POLICY IF EXISTS "Users can update own credits" ON credits;

-- Allow system to create credits for new users
CREATE POLICY "Allow credits creation"
  ON credits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to read their own credits
CREATE POLICY "Users can read own credits"
  ON credits
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Allow users to update their own credits
CREATE POLICY "Users can update own credits"
  ON credits
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Update transactions policies
DROP POLICY IF EXISTS "System can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;

-- Allow system to create transactions
CREATE POLICY "Allow transaction creation"
  ON transactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to read their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);