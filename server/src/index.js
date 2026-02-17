import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { z } from "zod";
import { config } from "./config.js";
import { createJob, getJob, updateJob } from "./db.js";
import { jobQueue } from "./queue.js";
import { getSignedObjectUrl } from "./s3.js";

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
  promptPlan: z.any().optional()
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

    const incoming = (body.promptPlan && typeof body.promptPlan === "object") ? body.promptPlan : {};
    const normalizedPlan = {
      platform: (incoming.platform || "linkedin"),
      audience_targeting: {
        geography: incoming?.audience_targeting?.geography || "United States and Canada",
        job_title: incoming?.audience_targeting?.job_title || "Product Marketing Managers and Growth Marketers",
        company_category: incoming?.audience_targeting?.company_category || "B2B SaaS companies"
      },
      message_framework: {
        hook: incoming?.message_framework?.hook || "Still spending too much time creating ad creatives?",
        problem: incoming?.message_framework?.problem || "Teams lose momentum because campaign assets take too long to produce.",
        solution: incoming?.message_framework?.solution || "This product uses its features and expertise to create quality campaign assets quickly.",
        cta: incoming?.message_framework?.cta || "Start your campaign today."
      },
      style_controls: {
        visual_style: incoming?.style_controls?.visual_style || "clean product UI, premium b2b look",
        pacing: incoming?.style_controls?.pacing || "fast with decisive cuts",
        camera_technique: incoming?.style_controls?.camera_technique || "steady product hero shots with kinetic overlays",
        image_technique: incoming?.style_controls?.image_technique || "vector illustration"
      }
    };

    const nextSummary = {
      ...(job.summary_json || {}),
      prompt_plan: normalizedPlan
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
    if (err instanceof z.ZodError) {
      const first = err.errors[0];
      const field = first?.path?.join(".") || "unknown";
      return res.status(400).json({
        error: first?.message || "Invalid request",
        field
      });
    }
    return res.status(400).json({ error: err.message || "Invalid request" });
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
  let imageUrl = generatedAssets.image_url || null;
  if (generatedAssets.image_key) {
    try {
      imageUrl = await getSignedObjectUrl(generatedAssets.image_key);
    } catch (error) {
      console.error("[api] failed to sign image URL", error);
    }
  }
  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    generatedPrompt: job.prompt_a,
    generatedPlan: job.summary_json,
    videoAUrl: job.video_a_url,
    videoBUrl: job.video_b_url,
    imageUrl,
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
