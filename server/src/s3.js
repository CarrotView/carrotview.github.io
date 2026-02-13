import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "./config.js";

export const s3 = new S3Client({
  region: config.s3Region,
  credentials: {
    accessKeyId: config.s3AccessKeyId,
    secretAccessKey: config.s3SecretAccessKey
  }
});

export function buildPublicUrl(key) {
  return `${config.s3PublicBaseUrl.replace(/\/$/, "")}/${key}`;
}

export async function uploadVideo({ key, buffer }) {
  await s3.send(
    new PutObjectCommand({
      Bucket: config.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: "video/mp4"
    })
  );

  return buildPublicUrl(key);
}

export async function uploadImage({ key, buffer, contentType = "image/png" }) {
  await s3.send(
    new PutObjectCommand({
      Bucket: config.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  );

  return buildPublicUrl(key);
}
