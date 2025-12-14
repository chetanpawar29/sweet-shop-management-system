/*
  # Sweet Shop Management System Schema

  ## Overview
  This migration creates the core tables for the Sweet Shop Management System,
  including sweet inventory and user profiles with role-based access control.

  ## New Tables
  
  ### 1. profiles
  Extended user information linked to Supabase auth.users
  - `id` (uuid, primary key) - References auth.users(id)
  - `email` (text) - User's email address
  - `is_admin` (boolean, default false) - Admin role flag
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 2. sweets
  Sweet inventory management
  - `id` (uuid, primary key) - Unique sweet identifier
  - `name` (text, not null) - Sweet name
  - `category` (text, not null) - Sweet category (e.g., Chocolate, Candy, Gummy)
  - `price` (numeric, not null) - Price per unit
  - `quantity` (integer, not null, default 0) - Stock quantity
  - `description` (text) - Optional sweet description
  - `image_url` (text) - Optional image URL
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### profiles table
  - RLS enabled
  - Users can read all profiles
  - Users can update only their own profile
  - New profiles created automatically via trigger on auth.users
  
  ### sweets table
  - RLS enabled
  - All authenticated users can read sweets
  - Only admins can insert, update, or delete sweets

  ## Functions & Triggers
  - Auto-create profile when new user signs up
  - Auto-update updated_at timestamp on sweets table
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create sweets table
CREATE TABLE IF NOT EXISTS sweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  description text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sweets ENABLE ROW LEVEL SECURITY;

-- Sweets RLS Policies
CREATE POLICY "Anyone can view sweets"
  ON sweets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert sweets"
  ON sweets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update sweets"
  ON sweets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete sweets"
  ON sweets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sweets updated_at
DROP TRIGGER IF EXISTS on_sweets_updated ON sweets;
CREATE TRIGGER on_sweets_updated
  BEFORE UPDATE ON sweets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample sweets data
INSERT INTO sweets (name, category, price, quantity, description, image_url) VALUES
  ('Milk Chocolate Bar', 'Chocolate', 2.99, 50, 'Creamy milk chocolate bar', 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Dark Chocolate Truffles', 'Chocolate', 5.99, 30, 'Rich dark chocolate truffles', 'https://images.pexels.com/photos/2373520/pexels-photo-2373520.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Gummy Bears', 'Gummy', 1.99, 100, 'Assorted fruit-flavored gummy bears', 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Sour Worms', 'Gummy', 2.49, 75, 'Tangy sour gummy worms', 'https://images.pexels.com/photos/4686920/pexels-photo-4686920.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Lollipops', 'Candy', 0.99, 150, 'Colorful swirl lollipops', 'https://images.pexels.com/photos/3735169/pexels-photo-3735169.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Peppermint Candies', 'Candy', 1.49, 80, 'Refreshing peppermint hard candies', 'https://images.pexels.com/photos/6724353/pexels-photo-6724353.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Caramel Chews', 'Caramel', 3.49, 45, 'Soft and chewy caramel candies', 'https://images.pexels.com/photos/3631/summer-dessert-sweet-ice-cream.jpg?auto=compress&cs=tinysrgb&w=400'),
  ('Licorice Twists', 'Licorice', 2.79, 60, 'Classic black licorice twists', 'https://images.pexels.com/photos/4686921/pexels-photo-4686921.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT DO NOTHING;