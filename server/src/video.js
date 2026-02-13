import { config } from "./config.js";

const API_BASE = "https://api.openai.com/v1";

async function createVideoJob(prompt) {
  const form = new FormData();
  form.append("model", config.videoModel);
  form.append("prompt", prompt);
  form.append("seconds", String(config.videoSeconds));
  form.append("size", config.videoSize);

  const res = await fetch(`${API_BASE}/videos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`
    },
    body: form
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Video create failed: ${res.status} ${text}`);
  }

  return res.json();
}

async function getVideoStatus(videoId) {
  const res = await fetch(`${API_BASE}/videos/${videoId}`, {
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Video status failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function fetchVideoContent(videoId) {
  const res = await fetch(`${API_BASE}/videos/${videoId}/content`, {
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Video content failed: ${res.status} ${text}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function pollUntilComplete(videoId, options = {}) {
  const timeoutMs = options.timeoutMs || 8 * 60 * 1000;
  const intervalMs = options.intervalMs || 5000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const status = await getVideoStatus(videoId);
    if (status.status === "completed") return status;
    if (status.status === "failed") {
      throw new Error(`Video job failed: ${status.error || "unknown error"}`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Video generation timed out.");
}

export async function generateVideo(prompt) {
  const job = await createVideoJob(prompt);
  const finished = await pollUntilComplete(job.id);
  const buffer = await fetchVideoContent(finished.id);
  return { id: finished.id, buffer };
}
