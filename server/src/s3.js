import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

export async function getSignedObjectUrl(key, expiresIn = config.signedUrlExpiresSeconds) {
  const command = new GetObjectCommand({
    Bucket: config.s3Bucket,
    Key: key
  });
  return getSignedUrl(s3, command, { expiresIn });
}
