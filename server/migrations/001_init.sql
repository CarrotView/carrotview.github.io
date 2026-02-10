CREATE TABLE IF NOT EXISTS product_marketing_jobs (
  id UUID PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  progress TEXT,
  summary_json JSONB,
  prompt_a TEXT,
  prompt_b TEXT,
  video_a_url TEXT,
  video_b_url TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_marketing_jobs_status_idx
  ON product_marketing_jobs(status);
