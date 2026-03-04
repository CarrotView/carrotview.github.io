import express from "express";
import cors from "cors";
import { z } from "zod";
import dotenv from "dotenv";
import { buildPromptPlan, crawlWebsite, generateCampaignImage } from "./aiCampaign.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const publicAppUrl = process.env.PUBLIC_APP_URL || "http://localhost:4173";

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origin === publicAppUrl) return cb(null, true);
      return cb(null, true);
    }
  })
);
app.use(express.json({ limit: "2mb" }));

function normalizeUrlInput(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.includes("://") ? trimmed : `https://${trimmed}`;
}

const audienceDefaults = {
  geography: "United States and Canada",
  job_title: "Product Marketing Managers and Growth Marketers",
  company_category: "B2B SaaS companies"
};

const styleDefaults = {
  visual_style: "clean product UI, premium b2b look",
  pacing: "fast with decisive cuts",
  camera_technique: "steady product hero shots with kinetic overlays",
  image_technique: "vector illustration"
};

const generatePromptSchema = z.object({
  url: z.preprocess(normalizeUrlInput, z.string().url()),
  promptPlan: z.any().optional()
});

const generateImageSchema = z.object({
  promptPlan: z.object({
    platform: z.string().optional(),
    audience_targeting: z.object({
      geography: z.string().min(1),
      job_title: z.string().min(1),
      company_category: z.string().min(1)
    }),
    message_framework: z.object({
      hook: z.string().min(1),
      problem: z.string().min(1),
      solution: z.string().min(1),
      cta: z.string().optional()
    }),
    style_controls: z.object({
      visual_style: z.string().min(1),
      pacing: z.string().min(1),
      camera_technique: z.string().min(1),
      image_technique: z.string().min(1)
    })
  })
});

app.post("/api/ai-product-marketing/generate-prompt", async (req, res) => {
  try {
    const body = generatePromptSchema.parse(req.body);
    const page = await crawlWebsite(body.url);

    const incoming = body.promptPlan || {};
    const audience = {
      geography: incoming?.audience_targeting?.geography || audienceDefaults.geography,
      job_title: incoming?.audience_targeting?.job_title || audienceDefaults.job_title,
      company_category: incoming?.audience_targeting?.company_category || audienceDefaults.company_category
    };
    const style = {
      visual_style: incoming?.style_controls?.visual_style || styleDefaults.visual_style,
      pacing: incoming?.style_controls?.pacing || styleDefaults.pacing,
      camera_technique: incoming?.style_controls?.camera_technique || styleDefaults.camera_technique,
      image_technique: incoming?.style_controls?.image_technique || styleDefaults.image_technique
    };

    const promptPlan = await buildPromptPlan({ url: body.url, audience, style, page });

    return res.json({
      status: "prompt_ready",
      source: { url: body.url, title: page.title || null },
      promptPlan
    });
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors[0]?.message : err.message;
    return res.status(400).json({ error: message || "Invalid request" });
  }
});

app.post("/api/ai-product-marketing/generate-image", async (req, res) => {
  try {
    const body = generateImageSchema.parse(req.body);
    const imageUrl = await generateCampaignImage(body.promptPlan);
    return res.json({ status: "completed", imageUrl });
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors[0]?.message : err.message;
    return res.status(400).json({ error: message || "Unable to generate image" });
  }
});

app.get("/api/ai-product-marketing/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`AI API listening on ${port}`);
});
