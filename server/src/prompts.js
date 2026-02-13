export function buildStrategyPrompt({ url, combinedText }) {
  return `You are a product marketing strategist. Analyze the website content and return strict JSON with the following keys:
- product: short name
- industry: industry segment
- target_users: array of primary user roles
- value_props: array of concise value propositions
- differentiators: array of unique advantages
- competitors: array of likely competitors
- message_framework: object with keys hook, problem, solution, cta (each should be concise and distinct)
- style_controls: object with keys visual_style, pacing, camera_technique, mood
- prompt_a: compiled video prompt from the framework and style controls
- prompt_b: alternate compiled video prompt with a different opening hook
- tone: short description of tone

Rules:
- Output ONLY JSON. No markdown.
- Make prompts vivid, concrete, and suitable for a text-to-video model.
- Keep hook/problem/solution/cta each under 30 words.
- Keep each compiled prompt under 120 words.
- Assume vertical 9:16 format.
- Ensure hook and solution are never semantically identical.
- In message_framework.solution, explicitly explain how the company from the submitted URL solves the user's problem using its product features and domain expertise.
- Avoid generic solution language; include concrete capability-level wording.

Website URL: ${url}

Website content:
${combinedText}`;
}
