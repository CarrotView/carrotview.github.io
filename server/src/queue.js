import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "./config.js";

export const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null
});

export const jobQueue = new Queue("product-marketing", {
  connection
});
