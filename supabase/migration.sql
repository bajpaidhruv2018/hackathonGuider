-- ═══════════════════════════════════════════════════════
-- Hackathon Coach — Schema Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════

-- Add status column to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions (status);

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'sessions' AND column_name = 'status';
