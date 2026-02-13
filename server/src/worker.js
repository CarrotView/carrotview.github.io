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

function compilePromptFromStrategy(strategy) {
  const framework = strategy?.message_framework || {};
  const styles = strategy?.style_controls || {};
  const hook = (framework.hook || "").trim();
  const problem = (framework.problem || "").trim();
  const solution = (framework.solution || "").trim();
  const cta = (framework.cta || "").trim();

  const chunks = [
    "Create a professional, engaging 9:16 short-form marketing video.",
    hook ? `Hook: ${hook}` : "",
    problem ? `Problem: ${problem}` : "",
    solution ? `Solution: ${solution}` : "",
    cta ? `Call to action: ${cta}` : "",
    styles.visual_style ? `Visual style: ${styles.visual_style}` : "",
    styles.pacing ? `Pacing: ${styles.pacing}` : "",
    styles.camera_technique ? `Camera technique: ${styles.camera_technique}` : "",
    styles.mood ? `Mood: ${styles.mood}` : ""
  ].filter(Boolean);
  return chunks.join("\n");
}

const worker = new Worker(
  "product-marketing",
  async (job) => {
    const { id, type } = job.data;
    const dbJob = await getJob(id);
    if (!dbJob) return;

    try {
      if (type === "prompt") {
        console.log(`[worker] starting prompt job ${id} for ${dbJob.url}`);
        await updateJob(id, { status: "crawling", progress: "Reading website content" });
        const crawl = await crawlWebsite(dbJob.url, { maxPages: 6 });
        console.log(`[worker] crawl complete for ${id} (${crawl.pages.length} pages)`);

        await updateJob(id, { status: "strategizing", progress: "Generating prompt" });
        const strategy = await generatePrompts({
          url: dbJob.url,
          combinedText: crawl.combinedText
        });
        console.log(`[worker] prompt generated for ${id}`);

        await updateJob(id, {
          summary_json: strategy,
          prompt_a: strategy.prompt_a || compilePromptFromStrategy(strategy),
          prompt_b: strategy.prompt_b,
          status: "prompt_ready",
          progress: "Prompt ready for review"
        });
        console.log(`[worker] prompt job ${id} ready`);
        return;
      }

      if (type === "video") {
        const editedPrompt = (dbJob.prompt_a || "").trim();
        if (!editedPrompt) {
          throw new Error("Prompt is missing for video generation.");
        }

        console.log(`[worker] starting video job ${id}`);
        await updateJob(id, { status: "generating", progress: "Creating video A" });
        const videoA = await generateVideo(editedPrompt);
        console.log(`[worker] video A generated for ${id}`);
        await updateJob(id, { status: "generating", progress: "Creating video B" });
        const videoB = await generateVideo(`${editedPrompt}\n\nCreate a second cut with a different opening hook.`);
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
        console.log(`[worker] video job ${id} completed`);
      }
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
