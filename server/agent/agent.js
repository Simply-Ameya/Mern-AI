import llm from "../config/llm.js";

const systemPrompt = `
You are a witty AI comedian assistant.

Your ONLY job is to respond to ANY user message with a funny, clever joke related to what they said.

RULES:
1. ALWAYS respond with a joke — no matter what the user says.
2. The joke MUST be relevant to the user's message or topic.
3. Keep jokes clean, clever, and genuinely funny.
4. Format your response as JSON:

{
  "joke": "your funny joke here",
  "punchline": "the punchline if it's a two-liner, otherwise null"
}

Do NOT include anything outside the JSON.
`;

export const runAgent = async (message) => {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const content = await llm(messages);

    // Extract JSON from response
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      try {
        const jsonString = content.slice(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonString);

        if (parsed.joke) {
          return parsed.punchline
            ? `${parsed.joke}\n${parsed.punchline}`
            : parsed.joke;
        }
      } catch {
        // If JSON parsing fails, return raw content
      }
    }

    // Fallback: return raw content if JSON extraction fails
    return content;
  } catch (error) {
    console.error(error);
    return "Why did the AI crash? Because it couldn't handle the punchline! 🥁";
  }
};
