-- ═══════════════════════════════════════════════════════
-- Hackathon Coach — Schema Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════

-- ─── Create sessions table (if not exists) ──────────────
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept JSONB DEFAULT NULL,
  scope_critique JSONB DEFAULT NULL,
  roadmap JSONB DEFAULT NULL,
  pitch_outline JSONB DEFAULT NULL,
  blockers JSONB DEFAULT '[]'::jsonb,
  chat_history JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Add status column if table already existed ─────────
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- ─── Add created_at if missing ──────────────────────────
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ─── Index for filtering by status ──────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions (status);

-- ─── Row-Level Security ─────────────────────────────────
-- Enable RLS but allow anon access (public app, no auth).
-- Restrict to your own policies if you add authentication.
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for the anon role (public access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sessions'
      AND policyname = 'Allow public read'
  ) THEN
    CREATE POLICY "Allow public read"
      ON sessions FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sessions'
      AND policyname = 'Allow public insert'
  ) THEN
    CREATE POLICY "Allow public insert"
      ON sessions FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sessions'
      AND policyname = 'Allow public update'
  ) THEN
    CREATE POLICY "Allow public update"
      ON sessions FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sessions'
      AND policyname = 'Allow public delete'
  ) THEN
    CREATE POLICY "Allow public delete"
      ON sessions FOR DELETE
      USING (true);
  END IF;
END $$;

-- ─── Verify ─────────────────────────────────────────────
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'sessions'
ORDER BY ordinal_position;
