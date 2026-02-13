import { Worker } from "bullmq";
import { config } from "./config.js";
import { connection } from "./queue.js";
import { getJob, updateJob } from "./db.js";
import { crawlWebsite } from "./crawler.js";
import { openai } from "./openaiClient.js";
import { buildStrategyPrompt } from "./prompts.js";
import { generateVideo } from "./video.js";
import { uploadVideo } from "./s3.js";

async function generatePrompts({ url, combinedText }) {
  const prompt = buildStrategyPrompt({ url, combinedText });

  const completion = await openai.chat.completions.create({
    model: config.llmModel,
    messages: [
      { role: "system", content: "Return strict JSON only." },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });

  const raw = completion.choices[0]?.message?.content || "";
  const parsed = JSON.parse(raw);

  return parsed;
}

const worker = new Worker(
  "product-marketing",
  async (job) => {
    const { id } = job.data;
    const dbJob = await getJob(id);
    if (!dbJob) return;

    try {
      console.log(`[worker] starting job ${id} for ${dbJob.url}`);
      await updateJob(id, { status: "crawling", progress: "Reading website content" });
      const crawl = await crawlWebsite(dbJob.url, { maxPages: 6 });
      console.log(`[worker] crawl complete for ${id} (${crawl.pages.length} pages)`);

      await updateJob(id, { status: "strategizing", progress: "Generating prompts" });
      const strategy = await generatePrompts({
        url: dbJob.url,
        combinedText: crawl.combinedText
      });
      console.log(`[worker] prompts generated for ${id}`);

      await updateJob(id, {
        summary_json: strategy,
        prompt_a: strategy.prompt_a,
        prompt_b: strategy.prompt_b
      });

      await updateJob(id, { status: "generating", progress: "Creating video A" });
      const videoA = await generateVideo(strategy.prompt_a);
      console.log(`[worker] video A generated for ${id}`);
      await updateJob(id, { status: "generating", progress: "Creating video B" });
      const videoB = await generateVideo(strategy.prompt_b);
      console.log(`[worker] video B generated for ${id}`);

      await updateJob(id, { status: "uploading", progress: "Uploading videos" });
      const videoAUrl = await uploadVideo({
        key: `product-marketing/${id}/video-a.mp4`,
        buffer: videoA.buffer
      });
      const videoBUrl = await uploadVideo({
        key: `product-marketing/${id}/video-b.mp4`,
        buffer: videoB.buffer
      });
      console.log(`[worker] uploads complete for ${id}`);

      await updateJob(id, {
        status: "completed",
        progress: "Ready",
        video_a_url: videoAUrl,
        video_b_url: videoBUrl
      });
      console.log(`[worker] job ${id} completed`);
    } catch (error) {
      console.error(`[worker] job ${id} failed`, error);
      await updateJob(id, {
        status: "failed",
        progress: "Failed",
        error: error?.message || "Unknown error"
      });
    }
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});

console.log("Worker started");

process.on("unhandledRejection", (reason) => {
  console.error("[worker] unhandledRejection", reason);
});
