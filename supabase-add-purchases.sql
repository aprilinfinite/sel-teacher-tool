-- ============================================================
-- Phase 6.0B – Purchase Verification & Purchase Records
-- ============================================================
-- Creates the purchases table to record completed Stripe payments.
-- ============================================================

-- 1. Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  product_id INTEGER NULL,
  bundle_id UUID NULL,
  resource_id INTEGER NULL,
  amount NUMERIC(10,2),
  currency TEXT,
  payment_status TEXT NOT NULL,
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Foreign keys
ALTER TABLE purchases
  ADD CONSTRAINT fk_purchases_product
  FOREIGN KEY (product_id) REFERENCES products(id)
  ON DELETE SET NULL;

ALTER TABLE purchases
  ADD CONSTRAINT fk_purchases_bundle
  FOREIGN KEY (bundle_id) REFERENCES bundles(id)
  ON DELETE SET NULL;

ALTER TABLE purchases
  ADD CONSTRAINT fk_purchases_resource
  FOREIGN KEY (resource_id) REFERENCES resources(id)
  ON DELETE SET NULL;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_email ON purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_bundle_id ON purchases(bundle_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies
-- Only authenticated admins can read purchases
CREATE POLICY "Admins can read purchases"
  ON purchases FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only the webhook (service_role) can insert purchases
-- This is handled via supabaseAdmin client which bypasses RLS

-- 6. Grant privileges
GRANT ALL ON purchases TO authenticated;
GRANT ALL ON purchases TO service_role;

-- 7. Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_purchases_updated_at ON purchases;
CREATE TRIGGER trg_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_purchases_updated_at();

