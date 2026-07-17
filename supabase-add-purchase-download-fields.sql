-- ============================================================
-- Phase 6.0D – Secure Digital Delivery
-- Add download tracking fields to purchases table
-- ============================================================

ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMPTZ NULL;
