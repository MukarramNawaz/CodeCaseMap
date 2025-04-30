/*
  # Add subscription tables and stripe integration

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `plan_id` (text)
      - `status` (text)
      - `current_period_end` (timestamptz)
      - `cancel_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `plans`
      - `id` (text, primary key)
      - `name` (text)
      - `description` (text)
      - `price_monthly` (integer)
      - `price_yearly` (integer)
      - `stripe_price_monthly` (text)
      - `stripe_price_yearly` (text)
      - `features` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create plans table
CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price_monthly integer NOT NULL,
  price_yearly integer NOT NULL,
  stripe_price_monthly text NOT NULL,
  stripe_price_yearly text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_id text REFERENCES public.plans(id) ON DELETE RESTRICT NOT NULL,
  status text ,
  payment text,
  current_period_end timestamptz NOT NULL,
  cancel_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans policies
CREATE POLICY "Plans are viewable by everyone"
  ON public.plans
  FOR SELECT
  TO public
  USING (true);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default plans
INSERT INTO public.plans (id, name, description, price_monthly, price_yearly, stripe_price_monthly, stripe_price_yearly, features)
VALUES
  ('basic', 'Basic', 'Perfect for getting started', 0, 0, 'price_basic_monthly', 'price_basic_yearly',
   ARRAY['5 AI queries per day', 'Basic document analysis', 'Access to case library', '24/7 support', 'Limited export options']),
  
  ('pro', 'Pro', 'For growing businesses', 3999, 2999, 'price_pro_monthly', 'price_pro_yearly',
   ARRAY['100 AI queries per day', 'Advanced document analysis', 'Full case library access', 'Priority support', 'All export options', 'Custom case templates']),
  
  ('business', 'Business', 'For large organizations', 9999, 7999, 'price_business_monthly', 'price_business_yearly',
   ARRAY['Unlimited AI queries', 'Enterprise-grade document analysis', 'Full case library access', 'Priority support with dedicated manager', 'All export options', 'Custom case templates', 'Team collaboration features', 'Advanced analytics dashboard']);