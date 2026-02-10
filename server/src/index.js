import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { z } from "zod";
import { config } from "./config.js";
import { createJob, getJob, updateJob } from "./db.js";
import { jobQueue } from "./queue.js";

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin === config.publicAppUrl) return cb(null, true);
    return cb(null, true);
  }
}));
app.use(express.json({ limit: "1mb" }));

const generateSchema = z.object({
  url: z.string().url()
});

app.post("/api/product-marketing/generate", async (req, res) => {
  try {
    const body = generateSchema.parse(req.body);
    const id = randomUUID();

    await createJob({ id, url: body.url });
    await jobQueue.add("generate", { id });
    console.log(`[api] queued job ${id} for ${body.url}`);

    res.json({ jobId: id });
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors[0]?.message : err.message;
    res.status(400).json({ error: message || "Invalid request" });
  }
});

app.get("/api/product-marketing/status", async (req, res) => {
  const id = req.query.jobId;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing jobId" });
  }

  const job = await getJob(id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    videoAUrl: job.video_a_url,
    videoBUrl: job.video_b_url,
    error: job.error
  });
});

app.get("/api/product-marketing/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`API listening on ${config.port}`);
});
