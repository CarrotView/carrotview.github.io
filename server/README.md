# Product Marketing API

This backend powers the Product Marketing URL flow on the static site.

## Services
- PostgreSQL for job state
- Redis for queueing (BullMQ)
- S3 for video storage
- OpenAI for website analysis + Sora video generation

## Setup
1. Copy `.env.example` to `.env` and fill in values.
2. Run migrations in `migrations/001_init.sql` on your Postgres instance.
3. Install dependencies: `npm install`
4. Start API: `npm run dev`
5. Start worker: `npm run worker`

## API
- `POST /api/product-marketing/generate` `{ url }` -> `{ jobId }`
- `GET /api/product-marketing/status?jobId=...` -> `{ status, videoAUrl, videoBUrl }`
