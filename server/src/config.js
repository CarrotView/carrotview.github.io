import dotenv from "dotenv";

dotenv.config();

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return process.env[name];
}

const allowedSeconds = new Set([4, 8, 12]);
const parsedSeconds = Number(process.env.VIDEO_SECONDS || 12);

const allowedSizes = new Set(["720x1280", "1024x1792", "1280x720", "1792x1024"]);
const requestedSize = process.env.VIDEO_SIZE || "720x1280";
const allowedImageSizes = new Set(["1024x1024", "1024x1536", "1536x1024"]);
const requestedImageSize = process.env.IMAGE_SIZE || "1024x1024";

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8787),
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8787",
  publicAppUrl: process.env.PUBLIC_APP_URL || "http://localhost:4173",
  postgresUrl: requireEnv("POSTGRES_URL"),
  redisUrl: requireEnv("REDIS_URL"),
  openaiApiKey: requireEnv("OPENAI_API_KEY"),
  llmModel: process.env.LLM_MODEL || "gpt-4o-mini",
  videoModel: process.env.VIDEO_MODEL || "sora-2",
  imageModel: process.env.IMAGE_MODEL || "gpt-image-1",
  videoSeconds: allowedSeconds.has(parsedSeconds) ? parsedSeconds : 12,
  videoSize: allowedSizes.has(requestedSize) ? requestedSize : "720x1280",
  imageSize: allowedImageSizes.has(requestedImageSize) ? requestedImageSize : "1024x1024",
  s3Region: requireEnv("S3_REGION"),
  s3Bucket: requireEnv("S3_BUCKET"),
  s3AccessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
  s3SecretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
  s3PublicBaseUrl: requireEnv("S3_PUBLIC_BASE_URL")
};
