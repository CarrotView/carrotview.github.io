export function buildStrategyPrompt({ url, combinedText }) {
  return `You are a product marketing strategist. Analyze the website content and return strict JSON with the following keys:
- product: short name
- industry: industry segment
- target_users: array of primary user roles
- value_props: array of concise value propositions
- differentiators: array of unique advantages
- competitors: array of likely competitors
- prompt_a: a 1-paragraph video prompt for a 30-60s YouTube Short with a feature-forward angle
- prompt_b: a 1-paragraph video prompt for a 30-60s YouTube Short with a pain-point-to-outcome angle
- tone: short description of tone

Rules:
- Output ONLY JSON. No markdown.
- Make prompts vivid, concrete, and suitable for a text-to-video model.
- Keep each prompt under 110 words.
- Assume vertical 9:16 format.

Website URL: ${url}

Website content:
${combinedText}`;
}
