/*
  # Create users and credits system

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `avatar` (text, optional)
      - `google_id` (text, optional for Google OAuth users)
      - `password_hash` (text, optional for email/password users)
      - `email_verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `credits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `balance` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text, 'recharge' or 'consume')
      - `amount` (integer)
      - `description` (text)
      - `payment_method` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
</sql>

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar text,
  google_id text,
  password_hash text,
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  balance integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('recharge', 'consume')),
  amount integer NOT NULL,
  description text NOT NULL,
  payment_method text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Credits policies
CREATE POLICY "Users can read own credits"
  ON credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON credits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credits"
  ON credits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credits_updated_at
  BEFORE UPDATE ON credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();