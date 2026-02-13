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

function normalizeUrlInput(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.includes("://") ? trimmed : `https://${trimmed}`;
}

const generatePromptSchema = z.object({
  url: z.preprocess(normalizeUrlInput, z.string().url())
});

const generateVideoSchema = z.object({
  jobId: z.string().uuid(),
  prompt: z.string().min(20)
});

const generateImageSchema = z.object({
  jobId: z.string().uuid(),
  promptPlan: z.object({
    platform: z.string().min(1),
    audience_targeting: z.object({
      geography: z.string().min(1),
      job_title: z.string().min(1),
      company_category: z.string().min(1)
    }),
    message_framework: z.object({
      hook: z.string().min(1),
      problem: z.string().min(1),
      solution: z.string().min(1),
      cta: z.string().min(1)
    }),
    style_controls: z.object({
      visual_style: z.string().min(1),
      pacing: z.string().min(1),
      camera_technique: z.string().min(1),
      image_technique: z.string().min(1)
    })
  })
});

app.post("/api/product-marketing/generate-prompt", async (req, res) => {
  try {
    const body = generatePromptSchema.parse(req.body);
    const id = randomUUID();

    await createJob({ id, url: body.url });
    await jobQueue.add("generate-prompt", { id, type: "prompt" });
    console.log(`[api] queued prompt job ${id} for ${body.url}`);

    res.json({ jobId: id });
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors[0]?.message : err.message;
    res.status(400).json({ error: message || "Invalid request" });
  }
});

app.post("/api/product-marketing/generate-videos", async (req, res) => {
  try {
    const body = generateVideoSchema.parse(req.body);
    const job = await getJob(body.jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    await updateJob(body.jobId, {
      prompt_a: body.prompt.trim(),
      status: "queued_video",
      progress: "Queued for video generation",
      error: null
    });
    await jobQueue.add("generate-videos", { id: body.jobId, type: "video" });
    console.log(`[api] queued video job ${body.jobId}`);

    return res.json({ jobId: body.jobId });
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors[0]?.message : err.message;
    return res.status(400).json({ error: message || "Invalid request" });
  }
});

app.post("/api/product-marketing/generate-image", async (req, res) => {
  try {
    const body = generateImageSchema.parse(req.body);
    const job = await getJob(body.jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const nextSummary = {
      ...(job.summary_json || {}),
      prompt_plan: body.promptPlan
    };
    await updateJob(body.jobId, {
      summary_json: nextSummary,
      status: "queued_image",
      progress: "Queued for image generation",
      error: null
    });
    await jobQueue.add("generate-image", { id: body.jobId, type: "image" });
    console.log(`[api] queued image job ${body.jobId}`);
    return res.json({ jobId: body.jobId });
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors[0]?.message : err.message;
    return res.status(400).json({ error: message || "Invalid request" });
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

  const generatedAssets = (job.summary_json && job.summary_json.generated_assets) || {};
  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    generatedPrompt: job.prompt_a,
    generatedPlan: job.summary_json,
    videoAUrl: job.video_a_url,
    videoBUrl: job.video_b_url,
    imageUrl: generatedAssets.image_url || null,
    imagePromptUsed: generatedAssets.image_prompt || null,
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
