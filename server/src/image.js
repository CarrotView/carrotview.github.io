import { openai } from "./openaiClient.js";
import { config } from "./config.js";

export async function generateImage(prompt) {
  const result = await openai.images.generate({
    model: config.imageModel,
    prompt,
    size: config.imageSize
  });

  const item = result?.data?.[0];
  if (!item) {
    throw new Error("Image generation returned no data.");
  }

  if (item.b64_json) {
    return {
      buffer: Buffer.from(item.b64_json, "base64"),
      contentType: "image/png"
    };
  }

  if (item.url) {
    const res = await fetch(item.url);
    if (!res.ok) {
      throw new Error(`Failed to download generated image: ${res.status}`);
    }
    const ab = await res.arrayBuffer();
    return {
      buffer: Buffer.from(ab),
      contentType: res.headers.get("content-type") || "image/png"
    };
  }

  throw new Error("Image generation returned neither base64 nor URL.");
}
