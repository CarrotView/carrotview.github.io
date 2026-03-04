import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.0-flash-preview-image-generation";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing environment variable: GEMINI_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
}

export async function crawlWebsite(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, svg").remove();

  return {
    title: $("title").text().trim(),
    text: $("body").text().replace(/\s+/g, " ").trim().slice(0, 20000)
  };
}

function sanitizeJson(raw) {
  if (!raw) return "{}";
  return String(raw).replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

export async function buildPromptPlan({ url, audience, style, page }) {
  const ai = getGeminiClient();
  const prompt = `You are generating a LinkedIn ad campaign prompt plan.
Return ONLY valid JSON with this exact schema:
{
  "platform": "linkedin",
  "audience_targeting": {
    "geography": "string",
    "job_title": "string",
    "company_category": "string"
  },
  "message_framework": {
    "hook": "string",
    "problem": "string",
    "solution": "string",
    "cta": "string"
  },
  "style_controls": {
    "visual_style": "string",
    "pacing": "string",
    "camera_technique": "string",
    "image_technique": "string"
  }
}

Rules:
- Hook must be short and attention-grabbing for a LinkedIn scrolling feed.
- Problem must describe a real business pain for the target audience.
- Solution must explicitly explain how the company from the URL solves the problem through its product/features/expertise.
- CTA should be specific and professional.
- Keep each field under 200 characters.

Input URL: ${url}
Page title: ${page.title || "N/A"}
Page content excerpt: ${page.text}
Audience defaults: ${JSON.stringify(audience)}
Style defaults: ${JSON.stringify(style)}
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const data = JSON.parse(sanitizeJson(response.text));
  return {
    platform: "linkedin",
    audience_targeting: {
      geography: data?.audience_targeting?.geography || audience.geography,
      job_title: data?.audience_targeting?.job_title || audience.job_title,
      company_category: data?.audience_targeting?.company_category || audience.company_category
    },
    message_framework: {
      hook: data?.message_framework?.hook || "Stop losing momentum on campaign production.",
      problem: data?.message_framework?.problem || "Marketing teams lose pipeline because quality ad assets take too long.",
      solution:
        data?.message_framework?.solution ||
        "This company solves the problem with a product workflow that converts website insights into high-quality campaign creatives.",
      cta: data?.message_framework?.cta || "See how fast your next campaign can launch."
    },
    style_controls: {
      visual_style: data?.style_controls?.visual_style || style.visual_style,
      pacing: data?.style_controls?.pacing || style.pacing,
      camera_technique: data?.style_controls?.camera_technique || style.camera_technique,
      image_technique: data?.style_controls?.image_technique || style.image_technique
    }
  };
}

function buildImagePrompt(promptPlan) {
  const framework = promptPlan?.message_framework || {};
  const targeting = promptPlan?.audience_targeting || {};
  const style = promptPlan?.style_controls || {};

  return [
    "Create a professional static LinkedIn ad image.",
    `Audience: ${targeting.job_title || "B2B marketing leaders"} in ${targeting.geography || "North America"}.`,
    `Company type: ${targeting.company_category || "B2B SaaS"}.`,
    `Hook: ${framework.hook || ""}`,
    `Problem: ${framework.problem || ""}`,
    `Solution: ${framework.solution || ""}`,
    `CTA: ${framework.cta || ""}`,
    `Visual style: ${style.visual_style || "clean modern product marketing"}.`,
    `Pacing/composition cues: ${style.pacing || "clear hierarchy, conversion-focused"}.`,
    `Camera/layout cues: ${style.camera_technique || "hero composition with UI overlays"}.`,
    `Image technique: ${style.image_technique || "vector illustration"}.`,
    "No text gibberish. Keep design premium, brand-safe, and conversion-oriented."
  ].join("\n");
}

export async function generateCampaignImage(promptPlan) {
  const ai = getGeminiClient();
  const prompt = buildImagePrompt(promptPlan);

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"]
    }
  });

  const parts = response?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new Error("Image generation did not return image bytes");
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
}
